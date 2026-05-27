/**
 * Unit tests for buildPrompt's wake-data source resolution.
 *
 * Reproduces the bug fixed by this PR:
 *   Paperclip's heartbeat service passes wake metadata in `ctx.context`
 *   (the contextSnapshot from the heartbeat_runs row), not in `ctx.config`
 *   (the adapter's runtimeConfig). The previous implementation only read
 *   from `ctx.config.taskId`, so every wake — including @-mention comments
 *   and direct task assignments — fell through to the `{{#noTask}}` branch
 *   and Hermes agents replied with "No assigned Paperclip work" instead of
 *   doing the assigned task.
 *
 * Run with: npm test (after build).
 */
export {};
//# sourceMappingURL=build-prompt.spec.d.ts.map