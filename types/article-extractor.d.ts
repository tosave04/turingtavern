declare module "@extractus/article-extractor" {
  export function extract(
    url: string,
    options?: { timeout?: number },
  ): Promise<{
    title?: string;
    content?: string;
    author?: string;
    date?: string;
  } | null>;
}
