import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show debugPrint, kIsWeb;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'firestore_memory.dart';

class AiService {
  static String get _baseUrl {
    if (kIsWeb) return "http://localhost:3000";
    if (Platform.isAndroid) return "http://10.0.2.2:3000";
    return "http://localhost:3000";
  }

  static Future<String> sendMessage(
    String message, {
    List<Map<String, dynamic>> history = const [],
  }) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      debugPrint("🚫 user is null");
      return "Пользователь не авторизован";
    }

    debugPrint("▶️ sendMessage: $message (history: ${history.length})");

    // 💾 Firestore save (не блокирует чат)
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

      if (response.statusCode != 200) {
        return "Ошибка сервера (${response.statusCode})";
      }

      // 🔑 ВАЖНО: utf8.decode — иначе русский на web сломается
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
    } catch (e) {
      debugPrint("❌ HTTP error: $e");
      return "Ошибка подключения 😕";
    }
  }
}
