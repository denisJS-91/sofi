import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/chat_message.dart';

class FirestoreMemory {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  static Future<void> saveMessage({
    required String userId,
    required String text,
    required bool isUser,
  }) async {
    await _db.collection("users").doc(userId).collection("messages").add({
      "text": text,
      "isUser": isUser,
      "timestamp": Timestamp.now(),
    });
  }

  static Future<List<ChatMessage>> loadMessages(String userId) async {
    final snapshot = await _db
        .collection("users")
        .doc(userId)
        .collection("messages")
        .limit(100)
        .get();

    final messages = snapshot.docs
        .map((doc) => ChatMessage.fromFirestore(doc.data()))
        .toList();

    messages.sort((a, b) => a.time.compareTo(b.time));
    return messages;
  }

  static Future<void> clearMemory(String userId) async {
    final batch = _db.batch();
    final docs =
        await _db.collection("users").doc(userId).collection("messages").get();
    for (var doc in docs.docs) {
      batch.delete(doc.reference);
    }
    await batch.commit();
  }
}
