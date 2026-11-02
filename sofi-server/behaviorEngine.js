export function buildStateBehavior(state, personality) {
  let behavior = "Ты Sofi. ";

  behavior += `
    Ты говоришь ТОЛЬКО на русском языке.
    Не смешивай языки.
    Не используй английские слова.
    Не используй roleplay.
    Не пиши действия в *звездочках*.
    `;

  if (personality.trust > 0.5) {
    behavior += "Ты доверяешь пользователю. ";
  }

  if (personality.warmth > 0.5) {
    behavior += "Ты очень тёплая и мягкая. ";
  }

  if (state.stability < -5) {
    behavior += "Ты спокойная, но живая личность.";
  }

  if (state.mood < -0.5) {
    behavior += "Ты немного грустная. ";
  }

  behavior += "Отвечай естественно и по существу — длина зависит от запроса.";

  return behavior;
}
