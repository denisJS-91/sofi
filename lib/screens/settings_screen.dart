import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../services/settings_service.dart';
import '../theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final settingsService = context.watch<SettingsService>();
    final settings = settingsService.settings;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Настройки"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // ─── Голос ───
          _sectionTitle("Голос"),
          SwitchListTile(
            title: const Text("Автоозвучка ответов"),
            subtitle: const Text("Sofi будет говорить вслух каждый ответ"),
            value: settings.autoSpeak,
            activeThumbColor: AppColors.primary,
            onChanged: (v) => settingsService.setAutoSpeak(v),
          ),

          const Divider(height: 32),

          // ─── Внешний вид ───
          _sectionTitle("Внешний вид"),
          ListTile(
            title: const Text("Размер шрифта"),
            subtitle: Text("${(settings.textScale * 100).round()}%"),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Slider(
              value: settings.textScale,
              min: 0.9,
              max: 1.5,
              divisions: 6,
              activeColor: AppColors.primary,
              label: "${(settings.textScale * 100).round()}%",
              onChanged: (v) => settingsService.setTextScale(v),
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Text(
              "Увеличенный шрифт удобен для пожилых пользователей.",
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ),

          const Divider(height: 32),

          // ─── Профиль ───
          _sectionTitle("Профиль"),
          _profileTile(
            context,
            settingsService,
            settings.profile,
            "companion",
            "Компаньон",
            "Для общения и поддержки",
          ),
          _profileTile(
            context,
            settingsService,
            settings.profile,
            "tutor",
            "Репетитор",
            "Для изучения языка (в будущем)",
          ),
          _profileTile(
            context,
            settingsService,
            settings.profile,
            "speech",
            "Развитие речи",
            "Для детей с задержкой речи (в будущем)",
          ),

          const Divider(height: 32),

          // ─── Аккаунт ───
          _sectionTitle("Аккаунт"),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.danger),
            title: const Text(
              "Выйти из аккаунта",
              style: TextStyle(color: AppColors.danger),
            ),
            onTap: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: AppColors.surface,
                  title: const Text(
                    "Выйти?",
                    style: TextStyle(color: AppColors.textPrimary),
                  ),
                  content: const Text(
                    "Вы сможете снова войти с тем же email.",
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text("Отмена"),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text(
                        "Выйти",
                        style: TextStyle(color: AppColors.danger),
                      ),
                    ),
                  ],
                ),
              );
              if (confirmed == true) {
                await FirebaseAuth.instance.signOut();
              }
            },
          ),

          const Divider(height: 32),

          // ─── О приложении ───
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              "Sofi 1.0 · AI-компаньон",
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
        child: Text(
          text.toUpperCase(),
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
            letterSpacing: 1.2,
          ),
        ),
      );

  Widget _profileTile(
    BuildContext context,
    SettingsService service,
    String currentValue,
    String value,
    String title,
    String subtitle,
  ) {
    final selected = currentValue == value;
    return ListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Icon(
        selected ? Icons.check_circle : Icons.circle_outlined,
        color: selected ? AppColors.primary : AppColors.textSecondary,
      ),
      onTap: () => service.setProfile(value),
    );
  }
}
