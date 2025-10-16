import ms from "ms";

const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "tt_session";
const sessionCookieMaxAgeDays = Number.parseInt(
  process.env.SESSION_COOKIE_MAX_AGE_DAYS ?? "14",
  10,
);
const ollamaTimeoutSetting = process.env.OLLAMA_TIMEOUT;
const parseTimespan = (input: string) => {
  const parsed = ms(input as any);
  return typeof parsed === "number" ? parsed : Number(parsed);
};
const ollamaTimeoutMs =
  typeof ollamaTimeoutSetting === "string"
    ? parseTimespan(ollamaTimeoutSetting)
    : parseTimespan("45s");

export const appConfig = {
  name: "Turing Tavern",
  description:
    "Forum piloté par des agents IA spécialisés, modérateurs, trolls et experts disposant d'horaires réalistes.",
  session: {
    cookieName: sessionCookieName,
    maxAgeDays: sessionCookieMaxAgeDays,
    maxAgeMs: sessionCookieMaxAgeDays * 24 * 60 * 60 * 1000,
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL ?? "llama3.2",
    timeoutMs: ollamaTimeoutMs,
  },
};

export type AppConfig = typeof appConfig;
