import { sofiLock } from "./sofiLock.js";
import { retrieveMemory } from "../memory/retrievalEngine.js";
import { SOFI_CORE } from "../core/sofiCore.js";

export function buildPrompt(user, message) {

    const core = SOFI_CORE;

    const emotion = core.emotions.mood;
    const relationship = core.relationship[user.userId] || core.relationship.test1;

    return `
You are Sofi.

Emotion: ${emotion}
Trust: ${relationship.trust}
Closeness: ${relationship.closeness}

User says: ${message}

Respond naturally, consistent with emotional state.
`;
}