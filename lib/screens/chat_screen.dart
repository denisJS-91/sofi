import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/ai_service.dart';
import '../services/firestore_memory.dart';
import '../services/voice_service.dart';
import '../services/search_detector.dart';
import '../models/chat_message.dart';
import '../widgets/message_bubble.dart';
import '../widgets/chat_input.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  bool _isHistoryLoading = true;
  bool _isListening = false;
  bool _autoSpeak = true;
  bool _isSpeaking = false;
  String _statusText = "";

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isHistoryLoading = false);
      return;
    }
    try {
      final history = await FirestoreMemory.loadMessages(user.uid);
      if (!mounted) return;
      setState(() {
        _messages.clear();
        if (history.isEmpty) {
          _messages.add(ChatMessage(
            text: "Привет! Я Sofi. Я рядом, если тебе нужна помощь.",
            isUser: false,
            time: DateTime.now(),
          ));
        } else {
          _messages.addAll(history);
        }
        _isHistoryLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      debugPrint("loadHistory error: $e");
      if (!mounted) return;
      setState(() => _isHistoryLoading = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await VoiceService.stopListening();
      setState(() => _isListening = false);
      return;
    }
    setState(() {
      _isListening = true;
      _controller.clear();
    });
    await VoiceService.startListening(
      onResult: (text) {
        if (!mounted) return;
        _controller.text = text;
        _controller.selection = TextSelection.fromPosition(
          TextPosition(offset: text.length),
        );
        setState(() {});
      },
      onDone: () {
        if (!mounted) return;
        setState(() => _isListening = false);
        // 👈 автоматически отправляем, если есть текст
        if (_controller.text.trim().isNotEmpty) {
          sendMessage();
        }
      },
    );
  }

  Future<void> sendMessage() async {
    if (_isLoading) return;
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    if (_isListening) {
      await VoiceService.stopListening();
      setState(() => _isListening = false);
    }

    // 🔍 Определяем, будет ли поиск
    final willSearch = SearchDetector.shouldSearch(text);

    setState(() {
      _messages
          .add(ChatMessage(text: text, isUser: true, time: DateTime.now()));
      _isLoading = true;
      _statusText =
          willSearch ? "🔍 Sofi ищет в интернете..." : "Sofi печатает...";
    });
    _controller.clear();
    _scrollToBottom();

    // Если поиск — через 2 секунды меняем на «печатает...»
    if (willSearch) {
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted && _isLoading) {
          setState(() => _statusText = "Sofi печатает...");
        }
      });
    }

    String reply;
    try {
      final historyForBackend =
          _messages.map((m) => {"isUser": m.isUser, "text": m.text}).toList();
      reply = await AiService.sendMessage(text, history: historyForBackend);
    } catch (_) {
      reply = "Ошибка подключения 😕";
    }

    if (!mounted) return;
    setState(() {
      _messages
          .add(ChatMessage(text: reply, isUser: false, time: DateTime.now()));
      _isLoading = false;
      _statusText = "";
    });
    _scrollToBottom();

    if (_autoSpeak && !reply.contains("Ошибка")) {
      if (mounted) setState(() => _isSpeaking = true);
      try {
        await VoiceService.speak(reply);
      } finally {
        if (mounted) setState(() => _isSpeaking = false);
      }
    }
  }

  Future<void> _logout() async {
    await VoiceService.stopSpeaking();
    await VoiceService.stopListening();
    await FirebaseAuth.instance.signOut();
  }

  @override
  void dispose() {
    VoiceService.stopListening();
    VoiceService.stopSpeaking();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [AppColors.primary, Color(0xFF8B5CF6)],
                ),
              ),
              alignment: Alignment.center,
              child: const Text(
                "S",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text("Sofi"),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: "Выйти",
            onPressed: _logout,
          ),
        ],
      ),
      body: _isHistoryLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: _messages.isEmpty
                      ? const Center(
                          child: Text(
                            "Начни диалог с Sofi 👋",
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          itemCount: _messages.length,
                          itemBuilder: (context, index) {
                            final msg = _messages[index];
                            return MessageBubble(
                              message: msg,
                              onSpeak: msg.isUser
                                  ? null
                                  : () => VoiceService.speak(msg.text),
                            );
                          },
                        ),
                ),
                if (_isSpeaking && !_isLoading)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.volume_up,
                            size: 16, color: AppColors.primary),
                        SizedBox(width: 8),
                        Text(
                          "Sofi говорит…",
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                if (_isLoading)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        if (_statusText.isNotEmpty) ...[
                          const SizedBox(width: 8),
                          Text(
                            _statusText,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ChatInput(
                  controller: _controller,
                  isLoading: _isLoading,
                  isListening: _isListening,
                  onSend: sendMessage,
                  onToggleMic: _toggleListening,
                ),
              ],
            ),
    );
  }
}
