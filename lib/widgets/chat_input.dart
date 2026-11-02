import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ChatInput extends StatelessWidget {
  final TextEditingController controller;
  final bool isLoading;
  final bool isListening;
  final VoidCallback onSend;
  final VoidCallback onToggleMic;

  const ChatInput({
    super.key,
    required this.controller,
    required this.isLoading,
    required this.isListening,
    required this.onSend,
    required this.onToggleMic,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
      decoration: const BoxDecoration(
        color: AppColors.bg,
        border: Border(
          top: BorderSide(color: AppColors.surfaceElevated, width: 1),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            IconButton(
              onPressed: isLoading ? null : onToggleMic,
              icon: Icon(
                isListening ? Icons.stop_circle : Icons.mic,
                color: isListening ? AppColors.danger : AppColors.primary,
                size: 26,
              ),
              tooltip: isListening ? "Стоп" : "Говорить",
            ),
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 4,
                minLines: 1,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
                cursorColor: AppColors.primary,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: isListening ? "Слушаю..." : "Напиши сообщение...",
                ),
              ),
            ),
            const SizedBox(width: 6),
            IconButton(
              onPressed: isLoading ? null : onSend,
              icon: const Icon(Icons.arrow_upward, size: 22),
              style: IconButton.styleFrom(
                backgroundColor:
                    isLoading ? AppColors.surface : AppColors.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(48, 48),
              ),
              tooltip: "Отправить",
            ),
          ],
        ),
      ),
    );
  }
}
