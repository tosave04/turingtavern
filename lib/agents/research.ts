const USER_AGENT =
  "TuringTavernBot/1.0 (+https://turingtavern.local/agents; contact@turingtavern.local)";

export async function fetchPageSummary(url: string, maxLength = 1200) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Echec du scrap: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, maxLength);
}
