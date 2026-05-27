/**
 * Server-side execution logic for the Hermes Agent adapter.
 *
 * Spawns `hermes chat -q "..." -Q` as a child process, streams output,
 * and returns structured results to Paperclip.
 *
 * Verified CLI flags (hermes chat):
 *   -q/--query         single query (non-interactive)
 *   -Q/--quiet         quiet mode (no banner/spinner, only response + session_id)
 *   -m/--model         model name (e.g. anthropic/claude-sonnet-4)
 *   -t/--toolsets      comma-separated toolsets to enable
 *   --provider         inference provider (auto, openrouter, nous, etc.)
 *   -r/--resume        resume session by ID
 *   -w/--worktree      isolated git worktree
 *   -v/--verbose       verbose output
 *   --checkpoints      filesystem checkpoints
 *   --yolo             bypass dangerous-command approval prompts (agents have no TTY)
 *   --source           session source tag for filtering
 */
import type { AdapterExecutionContext, AdapterExecutionResult, UsageSummary } from "@paperclipai/adapter-utils";
/** @internal Exported for unit tests. Not part of the public adapter API. */
export declare function buildPrompt(ctx: AdapterExecutionContext, config: Record<string, unknown>): string;
interface ParsedOutput {
    sessionId?: string;
    response?: string;
    usage?: UsageSummary;
    costUsd?: number;
    errorMessage?: string;
}
export declare function parseHermesOutput(stdout: string, stderr: string): ParsedOutput;
/**
 * Decide the session params to persist for the next run.
 *
 * Only returns params on a clean successful exit. If the run errored or
 * timed out, any session id parsed from the output is suspect (the CLI
 * may have aborted mid-write or printed a sentinel like "session
 * expired"), and persisting it would brick the next heartbeat with
 * `--resume <bad-id>`.
 */
export declare function buildPersistedSessionParams(args: {
    persistSession: boolean;
    sessionId: string | null | undefined;
    exitCode: number | null;
    timedOut: boolean;
}): {
    sessionId: string;
} | null;
export declare function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
export {};
//# sourceMappingURL=execute.d.ts.map