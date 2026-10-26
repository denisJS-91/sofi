export function updateEvolutionMap(user) {

    if (!user.memory.evolution) {
        user.memory.evolution = {
            stage: "neutral",
            timeline: [],
            traits: {
                warmthTrend: 0,
                stabilityTrend: 0,
                opennessTrend: 0
            }
        };
    }

    const evo = user.memory.evolution;
    const state = user.memory.state;

    // 📊 обновляем тренды
    evo.traits.warmthTrend = smooth(evo.traits.warmthTrend, state.warmth);
    evo.traits.stabilityTrend = smooth(evo.traits.stabilityTrend, state.stability);
    evo.traits.opennessTrend = smooth(evo.traits.opennessTrend, state.openness);

    // 🧠 определяем стадию личности
    const stage = detectStage(evo.traits);

    // 📌 если стадия изменилась — фиксируем событие
    if (stage !== evo.stage) {
        evo.timeline.push({
            from: evo.stage,
            to: stage,
            time: Date.now()
        });

        evo.stage = stage;
    }

    return evo;
}

function detectStage(t) {

    const avg = (t.warmthTrend + t.stabilityTrend + t.opennessTrend) / 3;

    if (avg < -3) return "withdrawn";
    if (avg < 0) return "unstable";
    if (avg < 3) return "neutral";
    if (avg >= 3) return "open";
}

function smooth(prev, current) {
    return prev * 0.9 + current * 0.1;
}