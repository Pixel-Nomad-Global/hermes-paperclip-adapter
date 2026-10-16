/**
 * parseSessionRow against the row shape `hermes sessions export` emits
 * (fields copied from a real 2026-10-10 Cross Grain test-tenant session).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSessionRow } from "../dist/server/read-hermes-session-usage.js";

const row = {
  id: "20261010_180616_9beab1", model: "gemini-2.5-flash", billing_provider: "gemini",
  input_tokens: 246002, output_tokens: 905, cache_read_tokens: 184572, reasoning_tokens: 0,
  estimated_cost_usd: 0.0, actual_cost_usd: null, cost_status: "unknown", cost_source: "none",
};

test("parseSessionRow returns tokens, provider and model", () => {
  const u = parseSessionRow(JSON.stringify(row));
  assert.deepEqual(u.usage, { inputTokens: 246002, outputTokens: 905, cachedInputTokens: 184572 });
  assert.equal(u.billingProvider, "gemini");
  assert.equal(u.model, "gemini-2.5-flash");
  assert.equal(u.costUsd, 0);
});

test("parseSessionRow returns null for a session with no tokens", () => {
  assert.equal(parseSessionRow(JSON.stringify({ ...row, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0 })), null);
});
