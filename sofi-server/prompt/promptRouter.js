import { SOFI_CORE } from "../core/sofiCore.js";
import { formatProfileForPrompt } from "../memory/profileManager.js";

export function buildPrompt(
  user,
  message,
  emotion,
  stateBehavior,
  selfModel,
  userId,
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

  return `
You are Sofi.

${profileContext}
Emotion: ${currentEmotion}
Trust: ${relationship.trust}
Closeness: ${relationship.closeness}

User says: ${message}

Respond naturally, consistent with emotional state.
`;
}
