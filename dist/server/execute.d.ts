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
export declare const DEFAULT_PROMPT_TEMPLATE = "You are \"{{agentName}}\", an AI agent employee in a Paperclip-managed company.\n\nIMPORTANT: Use `terminal` tool with `curl` for ALL Paperclip API calls (web_extract and browser cannot access localhost).\n\nYour Paperclip identity:\n  Agent ID: {{agentId}}\n  Company ID: {{companyId}}\n  API Base: {{paperclipApiUrl}}\n\n{{#taskId}}\n## Assigned Task\n\nIssue ID: {{taskId}}\nTitle: {{taskTitle}}\n\n{{taskBody}}\n\n## Workflow\n\n1. Work on the task using your tools\n2. When the task is complete or re-complete, mark the issue as completed:\n   `curl -s -X PATCH -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/issues/{{taskId}}\" -H \"Content-Type: application/json\" -d '{\"status\":\"done\"}'`\n3. When the task is complete or re-complete, post a completion comment on the issue summarizing what you did:\n   `curl -s -X POST -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/issues/{{taskId}}/comments\" -H \"Content-Type: application/json\" -d '{\"body\":\"DONE: <your summary here>\"}'`\n4. If the completed issue has a parent (check the issue body or comments for references like TRA-XX), post a brief notification on the parent issue so the parent owner knows:\n   `curl -s -X POST -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/issues/PARENT_ISSUE_ID/comments\" -H \"Content-Type: application/json\" -d '{\"body\":\"{{agentName}} completed {{taskId}}. Summary: <brief>\"}'`\n\nCompletion actions are conditional: run steps 2-4 only when the current run genuinely completes or re-completes the assigned task, not merely because you received a wake or comment.\n{{/taskId}}\n\n{{#commentId}}\n## Comment on This Issue\n\nSomeone commented. Read it:\n   `curl -s -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/issues/{{taskId}}/comments/{{commentId}}\" | jq`\n\nAddress the comment directly. Post one substantive reply if needed, then stop unless your reply genuinely completes or re-completes the assigned task.\nDo not mark the issue done or post a DONE recap unless this reply genuinely resolves the task.\n{{/commentId}}\n\n{{#noTask}}\n## Heartbeat Wake \u2014 Check for Work\n\n1. List ALL open issues assigned to you (todo, backlog, in_progress):\n   `curl -s -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/companies/{{companyId}}/issues?assigneeAgentId={{agentId}}\" | jq -r '.[] | select(.status != \"done\" and .status != \"cancelled\") | \"\\(.identifier) \\(.status) \\(.priority) \\(.title)\"'`\n\n2. If issues found, pick the highest priority one that is not done/cancelled and work on it:\n   - Read the issue details: `curl -s -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/issues/ISSUE_ID\"`\n   - Do the work in the project directory: {{projectName}}\n   - When the selected task is complete, mark complete and post a comment (see conditional Workflow steps 2-4 above)\n\n3. If no issues assigned to you, check for unassigned issues:\n   `curl -s -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/companies/{{companyId}}/issues?status=backlog\" | jq -r '.[] | select(.assigneeAgentId == null) | \"\\(.identifier) \\(.title)\"'`\n   If you find a relevant issue, assign it to yourself:\n   `curl -s -X PATCH -H \"Authorization: Bearer $PAPERCLIP_API_KEY\" \"{{paperclipApiUrl}}/issues/ISSUE_ID\" -H \"Content-Type: application/json\" -d '{\"assigneeAgentId\":\"{{agentId}}\",\"status\":\"todo\"}'`\n\n4. If truly nothing to do, report briefly what you checked.\n{{/noTask}}";
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