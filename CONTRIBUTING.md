# Contributing

Requires Node.js 20.8+ and pnpm.

```bash
pnpm install
pnpm run check
```

Changes to API models should be verified against the current official ER:LC OpenAPI document. Do not add guessed response fields, hardcoded rate limits, credential logging, or automatic retries for commands.

Every behavior change needs a runtime test; every type-level API change needs an assertion in `tests/types.test.ts`.

## Reproducible prerelease testing

Do not install a moving Git branch when validating an unreleased build. A branch can point to different code on the next install while the package still reports the same version.

Use one of these reproducible inputs instead:

- a full Git commit SHA;
- the `.tgz` produced by `pnpm pack`;
- a published npm prerelease such as `4.0.0-beta.1`.

Before sharing a tarball, run `pnpm run check` and install that exact archive in a clean consumer project. Test the root import and every affected subpath export from the installed archive, not only from this repository.
