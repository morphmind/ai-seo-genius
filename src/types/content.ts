export interface GeneratedContent {
  title: string;
  permalink: string;
  metaDescription: string;
}

export type Provider = "openai" | "anthropic";
export type Model = "gpt-4o" | "gpt-4o-mini" | "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo" | "claude-3-opus" | "claude-3-sonnet" | "claude-3-haiku";