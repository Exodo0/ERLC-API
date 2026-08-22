# Contributing

Requires Node.js 20.8+ and pnpm.

```bash
pnpm install
pnpm run check
```

Changes to API models should be verified against the current official ER:LC OpenAPI document. Do not add guessed response fields, hardcoded rate limits, credential logging, or automatic retries for commands.

Every behavior change needs a runtime test; every type-level API change needs an assertion in `tests/types.test.ts`.
