import 'package:cloud_firestore/cloud_firestore.dart';

class MemoryService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  // 💾 сохранить факт
  static Future<void> saveFact({
    required String userId,
    required String key,
    required dynamic value,
  }) async {
    await _db.collection("users").doc(userId).set({
      "profile": {
        key: value,
      }
    }, SetOptions(merge: true));
  }

  // 📖 получить профиль
  static Future<Map<String, dynamic>> getProfile(String userId) async {
    final doc = await _db.collection("users").doc(userId).get();

    if (!doc.exists) return {};

    return doc.data()?["profile"] ?? {};
  }
}
