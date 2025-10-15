import { appConfig } from "@/lib/config";

type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

type OllamaResponse =
  | { ok: true; content: string }
  | { ok: false; error: string };

export async function callOllamaChat(
  messages: OllamaMessage[],
  options: OllamaChatOptions = {},
): Promise<OllamaResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.maxTokens ? options.maxTokens * 20 : appConfig.ollama.timeoutMs,
  );

  try {
    const response = await fetch(`${appConfig.ollama.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model ?? appConfig.ollama.defaultModel,
        stream: false,
        messages,
        options: {
          temperature: options.temperature ?? 0.5,
          num_predict: options.maxTokens ?? 256,
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Ollama error: ${response.status} ${response.statusText}`,
      };
    }

    const payload = await response.json();
    const content: string =
      payload?.message?.content ??
      payload?.response ??
      payload?.text ??
      "";

    if (!content) {
      return {
        ok: false,
        error: "Reponse Ollama vide.",
      };
    }

    return { ok: true, content };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Echec de connexion à Ollama.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
