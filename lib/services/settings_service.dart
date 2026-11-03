import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_settings.dart';

class SettingsService extends ChangeNotifier {
  static const _kAutoSpeak = 'settings.autoSpeak';
  static const _kTextScale = 'settings.textScale';
  static const _kThemeMode = 'settings.themeMode';
  static const _kProfile = 'settings.profile';
  static const _kWebSearch = 'settings.webSearch';

  UserSettings _settings = const UserSettings();
  UserSettings get settings => _settings;

  bool _loaded = false;
  bool get loaded => _loaded;

  /// Загрузить настройки при старте приложения
  Future<void> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _settings = UserSettings(
        autoSpeak: prefs.getBool(_kAutoSpeak) ?? true,
        textScale: prefs.getDouble(_kTextScale) ?? 1.0,
        themeMode: prefs.getString(_kThemeMode) ?? 'dark',
        profile: prefs.getString(_kProfile) ?? 'companion',
        webSearchEnabled: prefs.getBool(_kWebSearch) ?? true,
      );
      _loaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('SettingsService.load error: $e');
      _loaded = true;
      notifyListeners();
    }
  }

  Future<void> setAutoSpeak(bool value) async {
    _settings = _settings.copyWith(autoSpeak: value);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kAutoSpeak, value);
  }

  Future<void> setTextScale(double value) async {
    _settings = _settings.copyWith(textScale: value);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_kTextScale, value);
  }

  Future<void> setThemeMode(String value) async {
    _settings = _settings.copyWith(themeMode: value);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kThemeMode, value);
  }

  Future<void> setProfile(String value) async {
    _settings = _settings.copyWith(profile: value);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kProfile, value);
  }

  Future<void> setWebSearchEnabled(bool value) async {
    _settings = _settings.copyWith(webSearchEnabled: value);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kWebSearch, value);
  }
}
