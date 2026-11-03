class UserSettings {
  final bool autoSpeak; // автоозвучка ответов
  final double textScale; // размер шрифта (1.0 = стандарт, 1.3 = крупный)
  final String themeMode; // 'light' | 'dark' | 'system'
  final String profile; // 'companion' | 'tutor' | 'speech'
  final bool webSearchEnabled; // разрешён ли поиск в интернете

  const UserSettings({
    this.autoSpeak = true,
    this.textScale = 1.0,
    this.themeMode = 'dark',
    this.profile = 'companion',
    this.webSearchEnabled = true,
  });

  UserSettings copyWith({
    bool? autoSpeak,
    double? textScale,
    String? themeMode,
    String? profile,
    bool? webSearchEnabled,
  }) {
    return UserSettings(
      autoSpeak: autoSpeak ?? this.autoSpeak,
      textScale: textScale ?? this.textScale,
      themeMode: themeMode ?? this.themeMode,
      profile: profile ?? this.profile,
      webSearchEnabled: webSearchEnabled ?? this.webSearchEnabled,
    );
  }
}
