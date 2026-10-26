import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/ai_service.dart';
import '../services/firestore_memory.dart';
import '../models/chat_message.dart';

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
            text: "Привет 👋 Я Sofi. Я рядом, если тебе нужна помощь.",
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

  Future<void> sendMessage() async {
    if (_isLoading) return;
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages
          .add(ChatMessage(text: text, isUser: true, time: DateTime.now()));
      _isLoading = true;
    });
    _controller.clear();
    _scrollToBottom();

    String reply;
    try {
      reply = await AiService.sendMessage(text);
    } catch (_) {
      reply = "Ошибка подключения 😕";
    }

    if (!mounted) return;
    setState(() {
      _messages
          .add(ChatMessage(text: reply, isUser: false, time: DateTime.now()));
      _isLoading = false;
    });
    _scrollToBottom();
  }

  Future<void> _logout() async {
    await FirebaseAuth.instance.signOut();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Sofi"),
        backgroundColor: Colors.black,
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
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      return Align(
                        alignment: msg.isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: msg.isUser
                                ? Colors.blueAccent
                                : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            msg.text,
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: CircularProgressIndicator(),
                  ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          style: const TextStyle(color: Colors.white),
                          cursorColor: Colors.white,
                          onSubmitted: (_) => sendMessage(),
                          decoration: InputDecoration(
                            hintText: "Напиши сообщение...",
                            hintStyle: const TextStyle(color: Colors.white54),
                            filled: true,
                            fillColor: const Color(0xFF1E293B),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: _isLoading ? null : sendMessage,
                        icon: const Icon(Icons.send),
                        color: Colors.blueAccent,
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
