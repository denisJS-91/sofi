import { SOFI_CORE } from "../core/sofiCore.js";
import { formatProfileForPrompt } from "../memory/profileManager.js";

// Форматирует историю диалога для промпта
function formatHistory(history) {
  if (!Array.isArray(history) || history.length === 0) return "";

  // Берём последние 10 сообщений
  const recent = history.slice(-10);

  const lines = recent.map((m) => {
    const who = m.isUser ? "Пользователь" : "Sofi";
    return `${who}: ${m.text}`;
  });

  return `\n=== ИСТОРИЯ ДИАЛОГА (последние сообщения) ===\n${lines.join("\n")}\n=== КОНЕЦ ИСТОРИИ ===\n`;
}

export function buildPrompt(
  user,
  message,
  emotion,
  stateBehavior,
  selfModel,
  userId,
  history = [],
) {
  const core = SOFI_CORE;

  const currentEmotion = emotion || core.emotions.mood;
  const relationship = core.relationship[userId] ||
    core.relationship.test1 || {
      trust: 0.5,
      closeness: 0.5,
    };

  // 🧠 Профиль пользователя (имя + факты)
  const profileContext = userId ? formatProfileForPrompt(userId) : "";

  // 💬 История диалога
  const historyContext = formatHistory(history);

  return `
You are Sofi.

${profileContext}
Emotion: ${currentEmotion}
Trust: ${relationship.trust}
Closeness: ${relationship.closeness}
${historyContext}
User says: ${message}

Respond naturally, consistent with emotional state.
Use the dialogue history above to maintain context and continuity.
`;
}
