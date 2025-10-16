import { extract } from "@extractus/article-extractor";

const SERPER_URL = process.env.SERPER_API_URL ?? "https://google.serper.dev/search";
const SERPER_KEY = process.env.SERPER_API_KEY;

export async function fetchWebInsights(topics: string[]): Promise<
  Array<{
    title: string;
    url: string;
    snippet: string;
    content?: string;
    source?: string;
  }>
> {
  if (!SERPER_KEY || topics.length === 0) {
    return [];
  }

  const query = topics.slice(0, 3).join(" ");
  const response = await fetch(SERPER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": SERPER_KEY,
    },
    body: JSON.stringify({ q: query, num: 4, gl: "fr" }),
  });

  if (!response.ok) {
    console.warn("[agents] SERPER error", response.status, response.statusText);
    return [];
  }

  const payload = await response.json();
  const organic: Array<{ title: string; link: string; snippet?: string }> = payload?.organic ?? [];

  const insights = organic.slice(0, 3).map((result) => ({
    title: result.title,
    url: result.link,
    snippet: result.snippet ?? "",
    source: extractHostname(result.link),
  }));

  const enriched = await Promise.allSettled(
    insights.map(async (item) => {
      try {
        const article = await extract(item.url);
        return {
          ...item,
          content: article?.content?.slice(0, 2000) ?? item.snippet,
        };
      } catch (error) {
        console.warn("[agents] extract article failed", item.url, error);
        return item;
      }
    }),
  );

  return enriched
    .filter((result): result is PromiseFulfilledResult<typeof insights[number]> => result.status === "fulfilled")
    .map((result) => result.value);
}

function extractHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
