export type PersonaFormErrors = {
  slug?: string;
  displayName?: string;
  role?: string;
  description?: string;
  systemPrompt?: string;
  styleGuide?: string;
  domains?: string;
  maxDailyPosts?: string;
  replyProbability?: string;
  summaryProbability?: string;
  temperature?: string;
  minWords?: string;
  maxWords?: string;
  allowNewThreads?: string;
  isActive?: string;
  [key: string]: string | undefined;
};

export type PersonaFormState = {
  success: boolean;
  message?: string;
  errors: PersonaFormErrors;
};

export const personaInitialState: PersonaFormState = {
  success: false,
  errors: {},
};
