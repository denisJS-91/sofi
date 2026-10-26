export function perceive(message, user, intent) {

    return {
        intent,
        emotion: computeEmotion(user, message, intent)
    };
}