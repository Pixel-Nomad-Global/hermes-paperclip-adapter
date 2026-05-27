/**
 * Read per-session token usage and cost from Hermes' SQLite session store.
 *
 * Hermes records the following columns on its `sessions` table for every
 * conversation it runs (state.db at $HERMES_HOME/state.db):
 *
 *   input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
 *   reasoning_tokens, billing_provider, billing_base_url, billing_mode,
 *   estimated_cost_usd, actual_cost_usd, cost_status, cost_source,
 *   pricing_version
 *
 * The numbers come from the provider SDK responses (Anthropic / OpenAI /
 * etc.) — they're the real, authoritative usage figures. They surface to
 * the user via `hermes insights` and `hermes sessions export`.
 *
 * The adapter's existing stdout regexes (`TOKEN_USAGE_REGEX`, `COST_REGEX`)
 * only match if Hermes prints a `tokens: N input M output` / `cost: $X`
 * line — which it does NOT under the default Anthropic provider path.
 * Result: `cost_events` in Paperclip stays empty and the Costs UI shows
 * zero spend even for active agents.
 *
 * Rather than shipping a sqlite native dep or polling Hermes' DB directly,
 * this module shells out to Hermes' own `sessions export --session-id <id> -`
 * which emits the session row as the first line of JSONL on stdout.
 * Zero new deps, no engines bump.
 *
 * Returns null on any error (binary missing, session not found, malformed
 * JSON, older Hermes versions without the export command) so callers can
 * fall back to other sources without breaking the run.
 */
import type { UsageSummary } from "@paperclipai/adapter-utils";
export interface HermesSessionUsage {
    usage: UsageSummary;
    costUsd?: number;
    billingProvider?: string;
}
export interface ReadHermesSessionUsageOptions {
    /** Hermes CLI binary (default: HERMES_CLI). */
    hermesCmd?: string;
    /** Hermes home directory — drives which state.db gets read. */
    hermesHome?: string;
    /** Session UUID/timestamp id from a completed run. */
    sessionId: string;
    /** Hard timeout for the export process. */
    timeoutMs?: number;
}
/**
 * Spawn `hermes sessions export --session-id <id> -` and parse the first
 * JSONL line for token usage and cost.
 */
export declare function readHermesSessionUsage(opts: ReadHermesSessionUsageOptions): Promise<HermesSessionUsage | null>;
//# sourceMappingURL=read-hermes-session-usage.d.ts.map