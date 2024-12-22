export interface GeneratedContent {
  title: string;
  permalink: string;
  metaDescription: string;
  faq?: {
    questions: Array<{
      question: string;
      answer: string;
    }>;
    schema: {
      "@context": string;
      "@type": string;
      mainEntity: Array<{
        "@type": string;
        name: string;
        acceptedAnswer: {
          "@type": string;
          text: string;
        };
      }>;
    };
  };
}

export type Provider = "openai" | "anthropic";
export type Model = 
  | "gpt-4o" 
  | "gpt-4o-mini" 
  | "o1-mini" 
  | "claude-3.5-sonnet-2024-10-22" 
  | "claude-3.5-haiku" 
  | "claude-3-opus";

export type ContentType = "seo" | "faq";
