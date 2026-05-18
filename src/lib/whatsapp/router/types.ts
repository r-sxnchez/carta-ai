export type ConversationMode =
  | "greeting"
  | "onboarding"
  | "capability_question"
  | "constitutional_claim"
  | "follow_up"
  | "clarification"
  | "unsupported_input";

export interface RouteDecision {
  mode: ConversationMode;
  /** Claim text when mode is constitutional_claim */
  claim?: string;
  source: "rules" | "llm";
}
