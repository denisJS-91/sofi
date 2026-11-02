export function enforceConsistency(text) {
  if (!text) return "Я здесь.";

  let t = text;

  // ❌ убираем roleplay маркеры
  t = t.replace(/\*.*?\*/g, "");

  // ❌ убираем английский мусор (частично)
  t = t.replace(/\b(like|um|uh|you know)\b/gi, "");

  // ❌ убираем self-meta AI talk
  t = t.replace(/as an ai/i, "");
  t = t.replace(/i am an ai/i, "");

  // ❌ ломанные фразы
  t = t.replace(/\s+/g, " ").trim();

  // ❌ слишком длинные ответы — только если совсем гигантские
  if (t.length > 2000) {
    t = t.slice(0, 2000) + "...";
  }

  // ❌ если пусто после чистки
  if (t.length < 2) {
    return "Я здесь с тобой.";
  }

  return t;
}
