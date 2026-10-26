import 'package:cloud_firestore/cloud_firestore.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime time;

  ChatMessage({required this.text, required this.isUser, required this.time});

  Map<String, dynamic> toMap() => {
        'text': text,
        'isUser': isUser,
        'timestamp': Timestamp.fromDate(time),
      };

  factory ChatMessage.fromFirestore(Map<String, dynamic> map) {
    final raw = map['timestamp'] ?? map['time'];
    DateTime time;
    if (raw is Timestamp) {
      time = raw.toDate();
    } else if (raw is String) {
      time = DateTime.tryParse(raw) ?? DateTime.now();
    } else {
      time = DateTime.now();
    }
    return ChatMessage(
      text: (map['text'] as String?) ?? '',
      isUser: (map['isUser'] as bool?) ?? false,
      time: time,
    );
  }
}
