import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function slash(path) {
  return path.replaceAll("\\", "/");
}

function languageService(root, name, sourceWithMarker, options) {
  const file = slash(join(root, name));
  const position = sourceWithMarker.indexOf("/*cursor*/");
  assert.notEqual(position, -1, "completion marker is required");
  const source = sourceWithMarker.replace("/*cursor*/", "");
  const host = {
    getScriptFileNames: () => [file],
    getScriptVersion: () => "0",
    getScriptSnapshot: (path) => {
      if (path === file) return ts.ScriptSnapshot.fromString(source);
      const text = ts.sys.readFile(path);
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => slash(root),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (settings) => ts.getDefaultLibFilePath(settings),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    realpath: ts.sys.realpath,
  };
  return { file, position, service: ts.createLanguageService(host) };
}

test("published declarations provide constructor IntelliSense in TS and JS", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "erlc-api-intellisense-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const packageRoot = join(root, "node_modules", "erlc-api");
  await mkdir(packageRoot, { recursive: true });
  await cp(join(repository, "dist"), join(packageRoot, "dist"), { recursive: true });
  await writeFile(
    join(packageRoot, "package.json"),
    await readFile(join(repository, "package.json")),
  );

  const baseOptions = {
    allowJs: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
  };
  const cases = [
    ["consumer.ts", "", true],
    ["consumer-check.mjs", "// @ts-check\n", true],
    ["consumer.mjs", "", false],
  ];

  for (const [name, prefix, checkJs] of cases) {
    const source = `${prefix}import { ErlcClient } from "erlc-api";\nnew ErlcClient({\n/*cursor*/\n});\n`;
    const { file, position, service } = languageService(root, name, source, {
      ...baseOptions,
      checkJs,
    });
    const completions = service.getCompletionsAtPosition(file, position, {});
    const names = new Set(completions?.entries.map((entry) => entry.name));
    for (const expected of ["serverKey", "globalToken", "timeoutMs", "cache", "onRateLimit"]) {
      assert(names.has(expected), `${name} should suggest ${expected}`);
    }
    for (const documented of ["serverKey", "globalToken"]) {
      const entry = completions.entries.find((candidate) => candidate.name === documented);
      const details = service.getCompletionEntryDetails(
        file,
        position,
        documented,
        {},
        entry.source,
        {},
        entry.data,
      );
      assert(details?.documentation.length, `${documented} should expose JSDoc in ${name}`);
    }
    service.dispose();
  }

  const methodCases = [
    [
      "server-options.ts",
      `import { ErlcClient } from "erlc-api";\nconst erlc = new ErlcClient({ serverKey: "x" });\nerlc.server.get({ /*cursor*/ });`,
      ["include", "signal", "cache"],
    ],
    [
      "include-values.ts",
      `import { ErlcClient } from "erlc-api";\nconst erlc = new ErlcClient({ serverKey: "x" });\nerlc.server.get({ include: ["/*cursor*/"] });`,
      [
        "players",
        "staff",
        "joinLogs",
        "queue",
        "killLogs",
        "commandLogs",
        "modCalls",
        "emergencyCalls",
        "vehicles",
      ],
    ],
    [
      "command-options.ts",
      `import { ErlcClient } from "erlc-api";\nconst erlc = new ErlcClient({ serverKey: "x" });\nerlc.commands.execute(":h hi", { /*cursor*/ });`,
      ["signal"],
    ],
    [
      "map-response.ts",
      `import { fetchMapImages } from "erlc-api/maps";\nasync function run() { const result = await fetchMapImages(); result./*cursor*/ }`,
      ["maps"],
    ],
    [
      "auth-options.ts",
      `import { createAuthorizationUrlFromServerKey } from "erlc-api/auth";\ncreateAuthorizationUrlFromServerKey({ /*cursor*/ });`,
      ["serverKey", "applicationId"],
    ],
    [
      "auth-exports.ts",
      `import { /*cursor*/ } from "erlc-api/auth";`,
      [
        "extractServerIdFromServerKey",
        "createAuthorizationUrl",
        "createAuthorizationUrlFromServerKey",
      ],
    ],
  ];

  for (const [name, source, expectedEntries] of methodCases) {
    const { file, position, service } = languageService(root, name, source, baseOptions);
    const completions = service.getCompletionsAtPosition(file, position, {});
    const names = new Set(completions?.entries.map((entry) => entry.name));
    for (const expected of expectedEntries) {
      assert(names.has(expected), `${name} should suggest ${expected}`);
    }
    service.dispose();
  }

  const authSource = `import { /*cursor*/ } from "erlc-api/auth";`;
  const authLanguage = languageService(root, "auth-jsdoc.ts", authSource, baseOptions);
  const authCompletions = authLanguage.service.getCompletionsAtPosition(
    authLanguage.file,
    authLanguage.position,
    {},
  );
  const helper = authCompletions?.entries.find(
    (entry) => entry.name === "extractServerIdFromServerKey",
  );
  assert(helper, "auth subpath should suggest extractServerIdFromServerKey");
  const helperDetails = authLanguage.service.getCompletionEntryDetails(
    authLanguage.file,
    authLanguage.position,
    helper.name,
    {},
    helper.source,
    {},
    helper.data,
  );
  assert(helperDetails?.documentation.length, "Server ID helper should expose JSDoc");
  authLanguage.service.dispose();
});

test("all public subpaths resolve declarations with modern and legacy resolution", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "erlc-api-resolution-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const packageRoot = join(root, "node_modules", "erlc-api");
  await mkdir(packageRoot, { recursive: true });
  await cp(join(repository, "dist"), join(packageRoot, "dist"), { recursive: true });
  await writeFile(
    join(packageRoot, "package.json"),
    await readFile(join(repository, "package.json")),
  );
  const containingFile = join(root, "consumer.ts");
  const specifiers = ["erlc-api", "erlc-api/auth", "erlc-api/maps", "erlc-api/webhooks"];

  for (const moduleResolution of [
    ts.ModuleResolutionKind.NodeNext,
    ts.ModuleResolutionKind.Bundler,
    ts.ModuleResolutionKind.Node10,
  ]) {
    for (const specifier of specifiers) {
      const resolved = ts.resolveModuleName(
        specifier,
        containingFile,
        {
          module:
            moduleResolution === ts.ModuleResolutionKind.NodeNext
              ? ts.ModuleKind.NodeNext
              : ts.ModuleKind.ESNext,
          moduleResolution,
        },
        ts.sys,
      ).resolvedModule;
      assert(resolved, `${specifier} should resolve with moduleResolution ${moduleResolution}`);
      assert.match(
        resolved.resolvedFileName,
        /\.d\.ts$/,
        `${specifier} should resolve to declarations`,
      );
    }
  }
});
