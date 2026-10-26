export function postProcessSofi(text) {

    if (!text) return "…";

    let t = text;

    // убрать действия
    t = t.replace(/\*.*?\*/g, "");

    // убрать мусорные повторы пробелов
    t = t.replace(/\s+/g, " ");

    // убрать странные обрывы (очень короткие слова подряд)
    t = t.replace(/\b\w{1,2}\b/g, "");

    // ограничить длину (без убийства синтаксиса)
    const sentences = t.split(/[.!?]/).filter(Boolean);
    t = sentences.slice(0, 2).join(". ");

    return t.trim() || "…";
}
