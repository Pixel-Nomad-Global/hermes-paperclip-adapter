/**
 * Unit tests for the GL-5.1 concurrent-run guard (claimIssueRun).
 *
 * Reproduces the bug this guard fixes: Paperclip's concurrency gate is
 * per-agent, not per-issue, so a second automated wake for an issue that
 * already has a run in flight spawns a duplicate concurrent run (two
 * POST /process calls, two runs on one issue). claimIssueRun lets the second
 * run detect the first and skip.
 *
 * Run with: npm test (after build).
 */
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { claimIssueRun, CONCURRENCY_ALLOWED_WAKE_REASONS, INFLIGHT_TTL_MS, } from "./execute.js";
function freshRegistry() {
    return new Map();
}
test("second automated wake for the same in-flight issue is skipped", () => {
    const registry = freshRegistry();
    const first = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    assert.equal(first.skip, false, "first run should claim the slot");
    const second = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-B",
        wakeReason: "issue_continuation_needed",
        registry,
    });
    assert.equal(second.skip, true, "second concurrent run must be skipped");
    assert.match(second.guardReason ?? "", /already in flight/);
    assert.match(second.guardReason ?? "", /run-A/);
});
test("release frees the slot so a later run can proceed", () => {
    const registry = freshRegistry();
    const first = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    first.release();
    const later = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-C",
        wakeReason: "heartbeat_timer",
        registry,
    });
    assert.equal(later.skip, false, "after release the issue slot is free");
});
test("a different issue is never blocked by an unrelated in-flight run", () => {
    const registry = freshRegistry();
    claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    const other = claimIssueRun({
        issueId: "ISSUE-2",
        runId: "run-B",
        wakeReason: "heartbeat_timer",
        registry,
    });
    assert.equal(other.skip, false, "distinct issues have independent slots");
});
test("genuine user input (issue_commented) is never guarded", () => {
    const registry = freshRegistry();
    claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    const comment = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-B",
        wakeReason: "issue_commented",
        registry,
    });
    assert.equal(comment.skip, false, "a client comment mid-run is legitimate new input and must run");
    // Sanity: the allowlist is what makes this pass.
    assert.ok(CONCURRENCY_ALLOWED_WAKE_REASONS.has("issue_commented"));
    assert.ok(CONCURRENCY_ALLOWED_WAKE_REASONS.has("issue_reopened_via_comment"));
});
test("the same run re-claiming its own slot is idempotent, not skipped", () => {
    const registry = freshRegistry();
    claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    const reclaim = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    assert.equal(reclaim.skip, false, "a run must not block itself");
});
test("an expired in-flight entry is purged so a new run can claim", () => {
    const registry = freshRegistry();
    const t0 = 1_000_000;
    claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        now: t0,
        registry,
    });
    // A wake arriving after the TTL must not be blocked by the stale entry.
    const afterTtl = claimIssueRun({
        issueId: "ISSUE-1",
        runId: "run-B",
        wakeReason: "heartbeat_timer",
        now: t0 + INFLIGHT_TTL_MS + 1,
        registry,
    });
    assert.equal(afterTtl.skip, false, "stale entry past TTL must be purged");
});
test("runs with no issue id are never guarded", () => {
    const registry = freshRegistry();
    const a = claimIssueRun({
        issueId: undefined,
        runId: "run-A",
        wakeReason: "heartbeat_timer",
        registry,
    });
    const b = claimIssueRun({
        issueId: undefined,
        runId: "run-B",
        wakeReason: "heartbeat_timer",
        registry,
    });
    assert.equal(a.skip, false);
    assert.equal(b.skip, false, "issue-less heartbeats never collide on a slot");
});
//# sourceMappingURL=concurrent-run-guard.spec.js.map