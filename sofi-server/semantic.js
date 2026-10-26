
export function cosineSimilarity(a, b) {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function getRelevantMemory(user, message) {

    if (!user.memory.longTerm?.length) return [];

    const queryEmbedding = await getEmbedding(message);

    const scored = user.memory.longTerm
        .filter(m => m.embedding)
        .map(m => {

            const similarity = cosineSimilarity(queryEmbedding, m.embedding);

            const weight = m.importance || 1;

            return {
                ...m,
                score: similarity * weight
            };
        });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}