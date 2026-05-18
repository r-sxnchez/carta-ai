import type { ConversationThread, ConversationTurn, LastAnalysisContext } from "./types";

const TTL_MS = 30 * 60 * 1000;
const MAX_TURNS = 8;

const threads = new Map<string, ConversationThread>();

function prune(): void {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, thread] of threads) {
    if (thread.updatedAt < cutoff) threads.delete(id);
  }
}

export function getThread(userId: string): ConversationThread {
  prune();
  const existing = threads.get(userId);
  if (existing) return existing;

  const thread: ConversationThread = {
    userId,
    turns: [],
    updatedAt: Date.now(),
  };
  threads.set(userId, thread);
  return thread;
}

export function appendTurn(userId: string, turn: Omit<ConversationTurn, "at">): void {
  const thread = getThread(userId);
  thread.turns.push({ ...turn, at: Date.now() });
  if (thread.turns.length > MAX_TURNS) {
    thread.turns = thread.turns.slice(-MAX_TURNS);
  }
  thread.updatedAt = Date.now();
}

export function setLastAnalysis(userId: string, analysis: LastAnalysisContext): void {
  const thread = getThread(userId);
  thread.lastAnalysis = analysis;
  thread.updatedAt = Date.now();
}

export function recentTurns(thread: ConversationThread, count = 4): ConversationTurn[] {
  return thread.turns.slice(-count);
}
