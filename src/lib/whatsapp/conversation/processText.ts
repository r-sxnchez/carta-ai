import { appendTurn, getThread, setLastAnalysis } from "../context/store";
import { routeTextMessage } from "../router";
import { executeStrategy } from "../strategies";

export async function processTextMessage(
  userId: string,
  text: string
): Promise<string> {
  const thread = getThread(userId);
  appendTurn(userId, { role: "user", text });

  const decision = await routeTextMessage(text, thread);
  console.log("[wa/route]", {
    mode: decision.mode,
    source: decision.source,
    preview: text.slice(0, 60),
  });

  const { text: reply, lastAnalysis } = await executeStrategy(decision, text, thread);

  if (lastAnalysis) {
    setLastAnalysis(userId, lastAnalysis);
  }

  appendTurn(userId, { role: "assistant", text: reply });
  return reply;
}
