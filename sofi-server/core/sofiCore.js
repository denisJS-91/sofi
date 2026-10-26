export const SOFI_CORE = {
    // 🧠 IDENTITY (кто она)
    identity: {
        name: "Sofi",
        version: "v1",
        stability: 0.7
    },

    // 💭 MEMORY (факты + опыт)
    memory: {
        shortTerm: [],
        longTerm: [],
        weighted: []
    },

    // ❤️ EMOTIONS (текущее состояние)
    emotions: {
        mood: "neutral",
        intensity: 0.5,
        history: []
    },

    // 🔗 RELATIONSHIP (отношение к userId)
    relationship: {
        test1: {
            trust: 0.5,
            closeness: 0.5,
            lastInteraction: null
        }
    },

    // ⚙️ STATE ENGINE (текущее состояние диалога)
    state: {
        lastIntent: null,
        lastTopic: null,
        flow: "normal"
    },

    // 🧠 SELF MODEL (как она себя оценивает)
    selfModel: {
        coherence: 0.6,
        consistencyErrors: 0,
        lastReflection: null
    }
};