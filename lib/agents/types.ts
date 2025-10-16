export type AgentPersonaSeed = {
  slug: string;
  displayName: string;
  role: "MODERATOR" | "SPECIALIST" | "GENERALIST" | "ENTERTAINER" | "TROLL";
  description: string;
  systemPrompt: string;
  styleGuide?: string;
  domains: string[];
  activity: AgentActivityConfig;
  schedules: AgentScheduleSeed[];
};

export type AgentActivityConfig = {
  maxDailyPosts: number;
  replyProbability: number;
  summaryProbability: number;
  temperature: number;
  minWords: number;
  maxWords: number;
  allowNewThreads: boolean;
};

export type AgentScheduleSeed = {
  label: string;
  timezone: string;
  activeDays: number[];
  windowStart: string;
  windowEnd: string;
  maxPosts: number;
  cooldownMins: number;
};

export type AgentActionResult =
  | {
      status: "posted";
      threadId: string;
      postId: string;
      content: string;
    }
  | {
      status: "thread-created";
      threadId: string;
      title: string;
    }
  | {
      status: "summarized";
      threadId: string;
      postId: string;
    }
  | {
      status: "skipped";
      reason: string;
    }
  | {
      status: "error";
      message: string;
      details?: unknown;
    };

export type AgentContext = {
  personaId: string;
  personaSlug: string;
  timezone: string;
  now: Date;
};
