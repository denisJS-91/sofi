class SearchDetector {
  static final List<RegExp> _triggers = [
    RegExp(r'погод', caseSensitive: false),
    RegExp(r'новост', caseSensitive: false),
    RegExp(r'курс[а-я]*\s*(доллар|евро|рубл|биткоин|валют)',
        caseSensitive: false),
    RegExp(r'сколько\s+стоит', caseSensitive: false),
    RegExp(r'кто\s+так(ой|ая|ие)', caseSensitive: false),
    RegExp(r'что\s+так(ое|ие)', caseSensitive: false),
    RegExp(r'когда\s+(произошл|будет|начн|законч|выйд|откры)',
        caseSensitive: false),
    RegExp(r'где\s+(находит|купить|заказать|работает)', caseSensitive: false),
    RegExp(r'сегодня\s+в\s+', caseSensitive: false),
    RegExp(r'последн[а-я]+\s+(новост|событ)', caseSensitive: false),
    RegExp(r'что\s+случилось', caseSensitive: false),
    RegExp(r'как\s+добраться', caseSensitive: false),
    RegExp(r'расписани', caseSensitive: false),
  ];

  static bool shouldSearch(String message) {
    return _triggers.any((re) => re.hasMatch(message));
  }
}
