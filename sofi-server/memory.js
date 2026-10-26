import fs from "fs";
import { createInitialState } from "./stateEngine.js";

const MEMORY_FILE = "./memory.json";

export function loadMemory() {
    try {
        return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    } catch {
        return { users: {} };
    }
}

export function saveMemory(db) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(db, null, 2));
}

export function getUser(db, userId) {

    if (!db.users[userId]) {
        db.users[userId] = createNewUser();
    }

    const user = db.users[userId];

    // 🔥 защита от старых данных
    if (!user.memory.state) {
        user.memory.state = createInitialState();
    }

    return user;
}

function createNewUser() {
    return {
        memory: {
            facts: {},
            shortTerm: [],
            longTerm: [],

            identity: {
                trust: 0,
                familiarity: 0,
                emotionalBond: 0,
                lastInteraction: Date.now()
            },

            continuity: {
                mood: "neutral",
                lastMood: "neutral",
                streak: 0,
                lastMessageTime: Date.now(),
                behaviorMode: "stable"
            },

            state: createInitialState()
        }
    };
}

export function extractFacts(user, message) {

    const text = message.toLowerCase();

    if (text.includes("меня зовут")) {
        const name = message.split("меня зовут")[1]?.trim();
        if (name) user.memory.facts.name = name;
    }

    if (text.includes("я из")) {
        const origin = message.split("я из")[1]?.trim();
        if (origin) user.memory.facts.origin = origin;
    }

    if (text.includes("я люблю")) {
        const like = message.split("я люблю")[1]?.trim();
        if (like) {
            if (!user.memory.facts.likes) user.memory.facts.likes = [];
            user.memory.facts.likes.push(like);
        }
    }
}

export function updateMemory(user, message, reply) {

    user.memory.shortTerm.push({ role: "user", text: message });
    user.memory.shortTerm.push({ role: "assistant", text: reply });

    if (user.memory.shortTerm.length > 10) {
        user.memory.shortTerm.shift();
    }
}

export async function rememberImportant(user, message, getEmbedding) {

    const text = message.toLowerCase();

    const junk = ["ок", "понятно", "ясно", "hi", "hello", "привет"];
    if (junk.includes(text)) return;

    let importance = 1;

    if (text.includes("живу")) importance = 8;
    if (text.includes("работаю")) importance = 7;
    if (text.includes("люблю")) importance = 6;
    if (text.includes("боюсь")) importance = 9;
    if (text.includes("мечта")) importance = 8;

    if (importance < 5) return;

    let embedding = null;

    if (message.length > 10 && getEmbedding) {
        embedding = await getEmbedding(message);
    }

    user.memory.longTerm.push({
        text: message,
        embedding,
        importance,
        timestamp: Date.now()
    });

    user.memory.longTerm.sort((a, b) => b.importance - a.importance);

    user.memory.longTerm = user.memory.longTerm.slice(0, 40);
}

export function decayMemory(user) {

    const now = Date.now();

    user.memory.longTerm = user.memory.longTerm
        .map(m => {

            const ageHours = (now - m.timestamp) / 3600000;
            const decay = ageHours * 0.02;

            return {
                ...m,
                importance: m.importance - decay
            };
        })
        .filter(m => m.importance > 1);
}