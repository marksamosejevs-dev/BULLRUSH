// Shared shape for every agent stub in this directory. Phase 1 agents all
// return this without doing any work; Phase 2 implementations should keep
// returning it as their type, just with `status` reaching SUCCEEDED.

export type AgentRunStatus = "NOT_CONFIGURED" | "SUCCEEDED" | "FAILED";

export interface AgentResult<T = unknown> {
  status: AgentRunStatus;
  message: string;
  data: T | null;
}

export function notConfigured(agentName: string): AgentResult<never> {
  return {
    status: "NOT_CONFIGURED",
    message: `${agentName} is not implemented yet. See docs/NEXT_STEPS.md for Phase 2 scope.`,
    data: null,
  };
}
