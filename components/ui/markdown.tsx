"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className"],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className"],
    ],
  },
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

const CodeBlock = ({ inline = false, className, children, ...props }: MarkdownCodeProps) => {
  if (inline) {
    return (
      <code
        {...props}
        className={clsx(
          "rounded bg-base-200 px-1 py-0.5 text-sm text-base-content/80",
          className,
        )}
      >
        {children}
      </code>
    );
  }
  return (
    <code
      {...props}
      className={clsx(
        "block overflow-x-auto rounded-lg bg-base-200/70 p-4 text-sm leading-relaxed text-base-content/80",
        className,
      )}
    >
      {children}
    </code>
  );
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 scroll-m-20 text-3xl font-bold tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-6 scroll-m-20 border-b border-base-300 pb-2 text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-6 scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 scroll-m-20 text-lg font-semibold tracking-tight">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="leading-7 text-base-content/90">{children}</p>,
  a: ({ children, href }) => (
    <a
      className="link link-primary break-words"
      href={href}
      target="_blank"
      rel="noreferrer noopener nofollow"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6">{children}</ol>,
  li: ({ children }) => <li className="text-base-content/90">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/40 pl-4 italic text-base-content/80">
      {children}
    </blockquote>
  ),
  code: CodeBlock,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-base-300/60">
      <table className="w-full min-w-[480px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-base-200 px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-t border-base-200 px-3 py-2 text-sm">{children}</td>,
};

type MarkdownProps = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={clsx("markdown-renderer space-y-3 text-base-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
