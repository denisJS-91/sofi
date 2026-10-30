import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_PATH = path.join(__dirname, "profile.json");

function loadProfiles() {
  try {
    if (!fs.existsSync(PROFILE_PATH)) return {};
    const raw = fs.readFileSync(PROFILE_PATH, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("profileManager load error:", e.message);
    return {};
  }
}

function saveProfiles(profiles) {
  try {
    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (e) {
    console.error("profileManager save error:", e.message);
  }
}

export function getProfile(userId) {
  const profiles = loadProfiles();
  return (
    profiles[userId] || {
      name: null,
      facts: [],
      lastUpdated: null,
    }
  );
}

export function updateProfile(userId, updates) {
  const profiles = loadProfiles();
  if (!profiles[userId]) {
    profiles[userId] = { name: null, facts: [], lastUpdated: null };
  }
  profiles[userId] = {
    ...profiles[userId],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  saveProfiles(profiles);
  return profiles[userId];
}

export function mergeFacts(userId, newFacts) {
  const profiles = loadProfiles();
  if (!profiles[userId]) {
    profiles[userId] = { name: null, facts: [], lastUpdated: null };
  }

  const existing = profiles[userId].facts || [];

  for (const f of newFacts) {
    if (!f.key || !f.value) continue;
    const idx = existing.findIndex(
      (e) => e.key.toLowerCase() === f.key.toLowerCase(),
    );
    const fact = {
      key: f.key,
      value: f.value,
      confidence: f.confidence ?? 0.7,
      when: new Date().toISOString(),
    };
    if (idx >= 0) {
      existing[idx] = fact;
    } else {
      existing.push(fact);
    }
  }

  profiles[userId].facts = existing;
  profiles[userId].lastUpdated = new Date().toISOString();
  saveProfiles(profiles);
  return profiles[userId];
}

export function setUserName(userId, name) {
  const profiles = loadProfiles();
  if (!profiles[userId]) {
    profiles[userId] = { name: null, facts: [], lastUpdated: null };
  }
  profiles[userId].name = name;
  profiles[userId].lastUpdated = new Date().toISOString();
  saveProfiles(profiles);
  return profiles[userId];
}

export function formatProfileForPrompt(userId) {
  const p = getProfile(userId);
  const lines = [];

  // Имя — отдельно и явно
  if (p.name) {
    lines.push(`Имя пользователя: ${p.name}`);
  }

  // Факты — отдельным блоком с явным заголовком
  if (p.facts && p.facts.length > 0) {
    lines.push("Известные факты о пользователе (это НЕ имя):");
    for (const f of p.facts) {
      lines.push(`  • ${f.key}: ${f.value}`);
    }
  }

  if (lines.length === 0) return "";

  return (
    "Что ты знаешь о пользователе:\n" +
    lines.join("\n") +
    '\n\nВНИМАНИЕ: имя пользователя — только в строке "Имя пользователя:". ' +
    'Если такой строки нет — ты не знаешь имени. Строка "живёт в: Москва" означает город, а НЕ имя.\n'
  );
}
