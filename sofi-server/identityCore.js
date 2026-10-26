export function updateIdentity(user, message) {

    const text = message.toLowerCase();

    const id = user.memory.identity;

    // 🧠 базовая эволюция доверия
    id.familiarity += 0.1;

    // ❤️ позитив
    if (text.includes("спасибо") || text.includes("круто")) {
        id.trust += 0.3;
        id.emotionalBond += 0.2;
    }

    // 😢 негатив
    if (text.includes("плохо") || text.includes("бесишь")) {
        id.trust -= 0.5;
    }

    // 💬 частота общения
    const now = Date.now();
    const diffHours = (now - id.lastInteraction) / 3600000;

    if (diffHours < 1) {
        id.emotionalBond += 0.1;
    }

    id.lastInteraction = now;

    // clamp values
    id.trust = Math.max(-5, Math.min(10, id.trust));
    id.familiarity = Math.max(0, Math.min(10, id.familiarity));
    id.emotionalBond = Math.max(0, Math.min(10, id.emotionalBond));
}