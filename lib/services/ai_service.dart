import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform, SocketException;
import 'package:flutter/foundation.dart' show debugPrint, kIsWeb;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'firestore_memory.dart';

class AiService {
  static String get _baseUrl {
    if (kIsWeb) return "http://localhost:3000";
    if (Platform.isAndroid) return "http://172.20.10.5:3000";
    return "http://localhost:3000";
  }

  static Future<String> sendMessage(
    String message, {
    List<Map<String, dynamic>> history = const [],
  }) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      debugPrint("🚫 user is null");
      return "Сессия истекла. Войди заново.";
    }

    debugPrint("▶️ sendMessage: $message (history: ${history.length})");

    try {
      await FirestoreMemory.saveMessage(
        userId: user.uid,
        text: message,
        isUser: true,
      );
      debugPrint("✅ User message saved");
    } catch (e) {
      debugPrint("❌ Firestore save (user) error: $e");
    }

    try {
      debugPrint("🌐 POST $_baseUrl/chat ...");
      final response = await http
          .post(
            Uri.parse("$_baseUrl/chat"),
            headers: {"Content-Type": "application/json"},
            body: jsonEncode({
              "message": message,
              "userId": user.uid,
              "history": history,
            }),
          )
          .timeout(const Duration(seconds: 90));

      debugPrint("📡 status: ${response.statusCode}");

      if (response.statusCode == 401 || response.statusCode == 403) {
        return "Сессия истекла. Войди заново.";
      }
      if (response.statusCode == 429) {
        return "Лимит запросов исчерпан. Попробуй позже.";
      }
      if (response.statusCode >= 500) {
        return "Ошибка на сервере. Проверь, что бэкенд запущен.";
      }
      if (response.statusCode != 200) {
        return "Ошибка сервера (${response.statusCode})";
      }

      final data = jsonDecode(utf8.decode(response.bodyBytes));
      final reply = (data["reply"] as String?) ?? "Пустой ответ AI";

      debugPrint(
          "📡 reply (${reply.length} chars): ${reply.length > 60 ? '${reply.substring(0, 60)}...' : reply}");

      try {
        await FirestoreMemory.saveMessage(
          userId: user.uid,
          text: reply,
          isUser: false,
        );
        debugPrint("✅ AI reply saved");
      } catch (e) {
        debugPrint("❌ Firestore save (AI) error: $e");
      }

      return reply;
    } on TimeoutException {
      debugPrint("❌ TimeoutException");
      return "Сервер не отвечает. Попробуй ещё раз.";
    } on SocketException catch (e) {
      debugPrint("❌ SocketException: $e");
      return "Бэкенд недоступен. Запусти node index.js.";
    } on FormatException catch (e) {
      debugPrint("❌ FormatException: $e");
      return "Некорректный ответ сервера.";
    } catch (e) {
      debugPrint("❌ HTTP error: $e");
      final err = e.toString().toLowerCase();
      if (err.contains("failed to fetch") ||
          err.contains("clientexception") ||
          err.contains("connection refused") ||
          err.contains("socketexception")) {
        return "Бэкенд недоступен. Запусти node index.js.";
      }
      if (err.contains("timeout")) {
        return "Сервер не отвечает. Попробуй ещё раз.";
      }
      return "Ошибка подключения 😕";
    }
  }
}
