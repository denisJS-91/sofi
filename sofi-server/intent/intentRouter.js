export function detectIntent(message) {
    const text = message.toLowerCase().trim();

    if (/(плохо|грустно|тяжело|одиноко|страшно)/.test(text)) {
        return "emotional_support";
    }

    if (/(переведи|translate)/.test(text)) {
        return "translation";
    }

    if (/(объясни|что значит)/.test(text)) {
        return "explain";
    }

    if (/(документ|контракт|письмо)/.test(text)) {
        return "document_help";
    }

    return "chat";
}