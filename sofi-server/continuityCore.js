export function updateContinuity(user, emotion) {

    const c = user.memory.continuity;

    const now = Date.now();
    const diffMin = (now - c.lastMessageTime) / 60000;

    // 🔥 mood carry-over (важно)
    if (emotion === c.lastMood) {
        c.streak += 1;
    } else {
        c.streak = 0;
    }

    // 🧠 настроение не прыгает резко
    if (c.streak >= 2) {
        c.mood = emotion;
    }

    // ⏳ если долго не писал → “охлаждение”
    if (diffMin > 60) {
        c.behaviorMode = "distant";
    } else if (diffMin < 5) {
        c.behaviorMode = "engaged";
    } else {
        c.behaviorMode = "stable";
    }

    c.lastMood = emotion;
    c.lastMessageTime = now;
}