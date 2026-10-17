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
import { readFileSync } from "node:fs";
/** Env var naming the table file inside the Paperclip container. */
export const PRICE_TABLE_ENV = "PN_MODEL_PRICES";
/** "google/gemini-2.5-flash" and "gemini-2.5-flash" both find the same row. */
function lookup(models, model) {
    return models[model] ?? models[model.split("/").pop() ?? model];
}
export function priceFromTable(model, usage, path = process.env[PRICE_TABLE_ENV]) {
    if (!model || !path)
        return undefined;
    let models;
    try {
        models = JSON.parse(readFileSync(path, "utf8")).models ?? {};
    }
    catch {
        return undefined;
    }
    const row = lookup(models, model);
    if (!row || typeof row.input_per_mtok !== "number" || typeof row.output_per_mtok !== "number") {
        return undefined;
    }
    // Hermes' input_tokens excludes cache reads (agent/usage_pricing.py); without a
    // cached rate, cache reads are priced as ordinary input.
    const cached = usage.cachedInputTokens ?? 0;
    const cachedRate = row.cached_input_per_mtok ?? row.input_per_mtok;
    return ((usage.inputTokens * row.input_per_mtok +
        cached * cachedRate +
        usage.outputTokens * row.output_per_mtok) /
        1_000_000);
}
//# sourceMappingURL=price-table.js.map