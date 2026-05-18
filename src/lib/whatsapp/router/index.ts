import type { ConversationThread } from "../context/types";
import { classifyWithLlm } from "./classify";
import { matchRules } from "./rules";
import type { RouteDecision } from "./types";

export type { ConversationMode, RouteDecision } from "./types";

export async function routeTextMessage(
  text: string,
  thread: ConversationThread
): Promise<RouteDecision> {
  const rules = matchRules(text, thread);
  if (rules) return rules;
  return classifyWithLlm(text, thread);
}
