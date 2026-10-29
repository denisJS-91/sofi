import { extractFactsFromDialog } from "./memory/extractor.js";

extractFactsFromDialog("adam_test", "Привет, меня зовут Адам, я люблю кофе", "Здравствуйте, Адам!").then(() => {
  console.log("✅ extractor done");
  process.exit(0);
});