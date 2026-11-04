import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint, VoidCallback;
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:just_audio/just_audio.dart';
import 'package:http/http.dart' as http;
import 'ai_service.dart';

// Класс для потоковой передачи байтов в плеер (работает на всех платформах, включая Web)
class MyAudioSource extends StreamAudioSource {
  final Uint8List _buffer;

  MyAudioSource(this._buffer);

  @override
  Future<StreamAudioResponse> request([int? start, int? end]) async {
    start ??= 0;
    end ??= _buffer.length;
    return StreamAudioResponse(
      sourceLength: _buffer.length,
      contentLength: end - start,
      offset: start,
      stream: Stream.value(_buffer.sublist(start, end)),
      contentType: 'audio/mpeg',
    );
  }
}

class VoiceService {
  static final stt.SpeechToText _speech = stt.SpeechToText();
  static final AudioPlayer _audioPlayer = AudioPlayer();
  static bool _sttAvailable = false;

  // 🎯 TTS-сервер (Flask на 5001)
  // Web: localhost:5001
  // Android-эмулятор: 10.0.2.2:5001
  // Физический Android: замени 10.0.2.2 на IP Mac (например 192.168.1.42)
  static String get _ttsUrl => "${AiService.baseUrl}/tts";

  // ─────────── STT (распознавание речи) ───────────

  static Future<bool> initSTT() async {
    if (_sttAvailable) return true;
    try {
      _sttAvailable = await _speech.initialize(
        onError: (e) => debugPrint('STT error: $e'),
        onStatus: (s) => debugPrint('STT status: $s'),
      );
      return _sttAvailable;
    } catch (e) {
      debugPrint('STT init failed: $e');
      return false;
    }
  }

  static Future<void> startListening({
    required Function(String) onResult,
    required VoidCallback onDone,
  }) async {
    if (!await initSTT()) {
      debugPrint('STT недоступен');
      return;
    }

    String? localeId;
    try {
      final locales = await _speech.locales();
      final ru = locales.firstWhere(
        (l) => l.localeId.toLowerCase().startsWith('ru'),
        orElse: () => locales.first,
      );
      localeId = ru.localeId;
    } catch (_) {}

    await _speech.listen(
      onResult: (result) {
        onResult(result.recognizedWords);
        if (result.finalResult) onDone();
      },
      localeId: localeId,
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
    );
  }

  static Future<void> stopListening() async {
    await _speech.stop();
  }

  static bool get isListening => _speech.isListening;

  // ─────────── TTS (озвучка через бэкенд) ───────────

  static Future<void> speak(String text, {String? reference}) async {
    try {
      await _audioPlayer.stop();

      debugPrint('🌐 TTS POST → $_ttsUrl');

      final response = await http.post(
        Uri.parse(_ttsUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "text": text,
          "reference": reference,
        }),
      );

      if (response.statusCode != 200) {
        debugPrint("TTS request failed: ${response.statusCode}");
        return;
      }

      final Uint8List audioBytes = response.bodyBytes;

      if (kIsWeb) {
        await _audioPlayer.setAudioSource(MyAudioSource(audioBytes));
      } else {
        final tempDir = Directory.systemTemp;
        final file = File(
            '${tempDir.path}/sofi_tts_${DateTime.now().millisecondsSinceEpoch}.mp3');
        await file.writeAsBytes(audioBytes);
        await _audioPlayer.setFilePath(file.path);
      }

      // Запускаем воспроизведение
      _audioPlayer.play();

      // Ждём именно "completed", с таймаутом-страховкой 60 секунд
      await _audioPlayer.processingStateStream
          .firstWhere((state) => state == ProcessingState.completed)
          .timeout(
            const Duration(seconds: 60),
            onTimeout: () => ProcessingState.completed,
          );
    } catch (e) {
      debugPrint("TTS playback error: $e");
    }
  }

  static Future<void> stopSpeaking() async {
    await _audioPlayer.stop();
  }
}
