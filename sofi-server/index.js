import express from "express";
import cors from "cors";

import {
    loadMemory,
    saveMemory,
    getUser,
    extractFacts,
    updateMemory,
} from "./memory.js";
import { SOFI_CORE } from "./core/sofiCore.js";
import { applyIdentityLock } from "./ai/identityLock.js";
import { askAI, warmupAI } from "./ai.js";
import { updateIdentity } from "./identityCore.js";
import { updateState, buildStateBehavior } from "./stateEngine.js";
import { detectIntent } from "./intent/intentRouter.js";
import { computeEmotion } from "./emotionEngine.js";
import { buildPrompt } from "./prompt/promptRouter.js";
import { updatePersonality } from "./personalityCore.js";
import { updateTrajectory } from "./emotion/trajectoryEngine.js";
import { attachWeightedMemory } from "./memory/memoryWeighting.js";
import { updateEmotionalContinuity } from "./ai/emotionalContinuity.js";
import { stabilizeIdentity } from "./ai/identityStabilizer.js";
import { buildSelfModel } from "./ai/selfModel.js";
import { sleepCycle } from "./ai/sleepCycle.js";
import { updateEvolutionMap } from "./ai/evolutionMap.js";
import { updateRelationship } from "./ai/relationshipModel.js";
import { finalConsistency } from "./utils/finalConsistency.js";
import { monitorDrift } from "./ai/driftMonitor.js";

const activeRequests = new Set();

const app = express();
let db = loadMemory();

app.use(cors());
app.use(express.json());

/* ─────────────────────────────
   HEALTHCHECK
───────────────────────────── */
app.get("/health", (_, res) =>
    res.json({ ok: true, name: "sofi", v: 8 })
);

/* ─────────────────────────────
   USER INIT
───────────────────────────── */
function ensureUser(userId) {
    if (!SOFI_CORE.relationship[userId]) {
        SOFI_CORE.relationship[userId] = {
            trust: 0.5,
            closeness: 0.5,
            lastInteraction: Date.now(),
        };
    }
}

/* ─────────────────────────────
   CHAT ENDPOINT
───────────────────────────── */
app.post("/chat", async (req, res) => {
    const { message, userId } = req.body || {};

    if (!message || !userId) {
        return res.status(400).json({ reply: "missing fields" });
    }

    const key = userId;

    if (activeRequests.has(key)) {
        return res.json({ reply: "Подожди секунду..." });
    }

    activeRequests.add(key);

    try {
        // 1. USER
        const user = getUser(db, userId);

        // 2. INTENT
        const intent = detectIntent(message);

        // 3. EMOTION
        const emotion = computeEmotion(user, message, intent);

        // 4. STATE UPDATE
        updateState(user.memory.state, user, message, emotion);
        updateTrajectory(user, message, emotion);

        // 4.5 EVOLUTION MAP
        updateEvolutionMap(user);

        // 4.6 IDENTITY STABILIZER
        const result = stabilizeIdentity(user, user.memory.state, emotion);
        user.memory.state = result.state;

        // 5. PERSONALITY UPDATE
        updatePersonality(user, message);

        // 6. BEHAVIOR ENGINE
        const stateBehavior = buildStateBehavior(
            user.memory.state,
            user.memory.personality
        );

        // 6.5 SELF MODEL
        const selfModel = buildSelfModel(user, emotion);

        // 7. PROMPT
        let prompt = buildPrompt(
            user,
            message,
            emotion,
            stateBehavior,
            selfModel
        );

        // 🧠 IDENTITY LOCK
        prompt = applyIdentityLock(prompt);

        // 8. AI CALL (с таймаутом 50 сек)
        const rawReply = await Promise.race([
            askAI(prompt),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("AI timeout 50s")),
                    50000
                )
            ),
        ]);

        // 🧠 DRIFT MONITOR
        monitorDrift(SOFI_CORE, rawReply);

        // memory reacts to raw AI
        updateEmotionalContinuity(user, message, emotion, rawReply);
        updateRelationship(user, message, emotion, rawReply);

        // final output cleanup
        const reply = finalConsistency(rawReply);

        // 9. MEMORY
        attachWeightedMemory(user, message, "user", emotion, intent);
        attachWeightedMemory(user, reply, "assistant", emotion, intent);

        updateMemory(user, message, reply);

        if (user.memory.weighted.length % 10 === 0) {
            sleepCycle(user);
        }

        saveMemory(db);

        return res.json({ reply });
    } catch (e) {
        console.log("CHAT ERROR:", e);
        return res.json({
            reply: "Я немного зависла... попробуй ещё раз",
        });
    } finally {
        activeRequests.delete(key);
    }
});

/* ─────────────────────────────
   START
───────────────────────────── */
app.listen(3000, () => {
    console.log("🧠 Sofi V8 running on http://localhost:3000");
    warmupAI();
});