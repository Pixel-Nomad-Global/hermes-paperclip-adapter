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
export {};
//# sourceMappingURL=concurrent-run-guard.spec.d.ts.map