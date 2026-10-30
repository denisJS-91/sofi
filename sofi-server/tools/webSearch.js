import { websearch } from "@agent-sh/harness-websearch";

// Разрешения для zero-config поиска (ключи не нужны)
const session = {
  permissions: {
    roots: [],
    sensitivePatterns: [],
    unsafeAllowSearchWithoutHook: true,
  },
};

export async function webSearch(query, maxResults = 2) {
  try {
    console.log(`🔍 Web search: "${query}"`);

    const result = await Promise.race([
      websearch({ query, count: maxResults }, session),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Search timeout 15s")), 15000),
      ),
    ]);

    if (
      result.kind === "empty" ||
      !result.results ||
      result.results.length === 0
    ) {
      return "Ничего не найдено.";
    }

    return result.results
      .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.url}`)
      .join("\n\n");
  } catch (e) {
    console.error("❌ Web search error:", e.message);
    return `Ошибка поиска: ${e.message}`;
  }
}
