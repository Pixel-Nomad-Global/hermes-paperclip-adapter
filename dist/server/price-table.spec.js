/**
 * Unit tests for priceFromTable (GL-13). Run with: npm test (after build).
 */
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { priceFromTable } from "./price-table.js";
const dir = mkdtempSync(join(tmpdir(), "price-table-"));
const table = join(dir, "model-prices.json");
writeFileSync(table, JSON.stringify({
    models: {
        "gemini-2.5-flash": { input_per_mtok: 0.3, cached_input_per_mtok: 0.03, output_per_mtok: 2.5 },
        "no-cache-rate": { input_per_mtok: 1, output_per_mtok: 2 },
    },
}));
// The 2026-10-17 test-tenant run: 190,570 input, 144,977 cache read, 707 output.
const run = { inputTokens: 190570, cachedInputTokens: 144977, outputTokens: 707 };
test("prices the 17 Oct test-tenant run at Google list price", () => {
    const usd = priceFromTable("gemini-2.5-flash", run, table);
    // 190,570 x 0.30 + 144,977 x 0.03 + 707 x 2.50 = 63,287.81 micro-dollars.
    assert.ok(Math.abs(usd - 0.06328781) < 1e-9, String(usd));
});
test("a provider-prefixed model name finds the same row", () => {
    assert.equal(priceFromTable("google/gemini-2.5-flash", run, table), priceFromTable("gemini-2.5-flash", run, table));
});
test("cache reads fall back to the input rate when no cached rate is listed", () => {
    const usd = priceFromTable("no-cache-rate", { inputTokens: 1_000_000, cachedInputTokens: 1_000_000, outputTokens: 0 }, table);
    assert.equal(usd, 2);
});
test("unknown model, missing file and unset path leave Hermes' figure alone", () => {
    assert.equal(priceFromTable("gpt-unknown", run, table), undefined);
    assert.equal(priceFromTable("gemini-2.5-flash", run, join(dir, "missing.json")), undefined);
    assert.equal(priceFromTable("gemini-2.5-flash", run, undefined), undefined);
    assert.equal(priceFromTable(undefined, run, table), undefined);
});
//# sourceMappingURL=price-table.spec.js.map