/**
 * Price Hermes token usage from Pixel Nomad's own model price table (GL-13).
 *
 * Hermes prices a session from a snapshot it ships, and on 2026-10-17 that snapshot
 * had gemini-2.5-flash at a quarter of Google's list price and, under the `gemini`
 * provider name, found no price at all (`cost_status: unknown`, cost_events at $0).
 * The table (pixel-nomad-infra `config/model-prices.json`, USD per 1M tokens) is the
 * source of truth: when it lists the model, its price wins over Hermes' estimate.
 *
 * The file is read on every call, so a merged price PR applies on the next run
 * without a Paperclip rebuild. Any error (unset path, missing file, bad JSON,
 * model not listed) returns undefined and leaves Hermes' own figure in place.
 */
import type { UsageSummary } from "@paperclipai/adapter-utils";
/** Env var naming the table file inside the Paperclip container. */
export declare const PRICE_TABLE_ENV = "PN_MODEL_PRICES";
export declare function priceFromTable(model: string | null | undefined, usage: UsageSummary, path?: string | undefined): number | undefined;
//# sourceMappingURL=price-table.d.ts.map