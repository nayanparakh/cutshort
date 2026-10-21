import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

interface PublishConfig {
  provider?: string;
  owner?: string;
  repo?: string;
  channel?: string;
}

interface BuilderConfig {
  publish?: PublishConfig[];
  mac?: { target?: string[] };
  files?: string[];
}

let configLoads = 0;
async function configFor(target: string): Promise<BuilderConfig> {
  // Query isolation is intentional: the config reads CC_EB_TARGET once at module evaluation.
  process.env.CC_EB_TARGET = target;
  const moduleUrl = new URL(`../config/electron-builder.config.mjs?target=${target}&load=${++configLoads}`, import.meta.url);
  const loaded = await import(moduleUrl.href) as { default: BuilderConfig };
  return loaded.default;
}

const { RELEASE_REPOSITORY } = await import('../shared/release-repository.ts');
assert.ok(RELEASE_REPOSITORY, 'cutshort publishes releases to a configured repository');
const arm64 = await configFor('darwin-arm64');
assert.deepEqual(arm64.publish, [{
  provider: 'github',
  owner: RELEASE_REPOSITORY.owner,
  repo: RELEASE_REPOSITORY.repo,
  channel: 'latest-arm64',
}], 'electron-builder must publish where the app checks for updates');
assert.deepEqual(arm64.mac?.target, ['dmg', 'zip'], 'macOS updates need a zip artifact in addition to the DMG');
// Both main-process bundles have to ship: the entry imports ./app-main.mjs
// dynamically, so a package with only the entry fails every launch.
for (const bundle of ['desktop-dist/main.mjs', 'desktop-dist/app-main.mjs', 'desktop-dist/preload.cjs']) {
  assert.ok(arm64.files?.includes(bundle), `packages must ship ${bundle}`);
}
assert.ok(arm64.files?.includes('desktop-dist/native-asr-worker.mjs'));
assert.ok(arm64.files?.includes('desktop-dist/native-semantic-worker.mjs'));
assert.ok(arm64.files?.includes('desktop-dist/native-clap-worker.mjs'));
assert.ok(arm64.files?.includes('desktop-dist/native-rhythm-worker.mjs'));
assert.equal(
  arm64.files?.includes('!node_modules/onnxruntime-node/bin/napi-v6/darwin/arm64/**'),
  false,
  'the target ONNX Runtime binary must remain packaged',
);
assert.ok(
  arm64.files?.includes('!node_modules/onnxruntime-node/bin/napi-v6/win32/x64/**'),
  'foreign ONNX Runtime binaries must be excluded',
);

const x64 = await configFor('darwin-x64');
assert.equal(x64.publish?.[0]?.channel, 'latest-x64');
assert.equal(
  x64.files?.includes('!node_modules/onnxruntime-node/bin/napi-v6/darwin/x64/**'),
  false,
  'x64 packages must retain the x64 ONNX Runtime binary',
);

const linux = await configFor('linux-x64');
for (const worker of ['asr', 'semantic', 'clap', 'rhythm']) {
  assert.ok(
    linux.files?.includes(`desktop-dist/native-${worker}-worker.mjs`),
    `Linux packages must ship the native ${worker} worker`,
  );
}
assert.equal(
  linux.files?.includes('!node_modules/onnxruntime-node/bin/napi-v6/linux/x64/**'),
  false,
  'Linux packages must retain the target ONNX Runtime binary',
);
assert.ok(
  linux.files?.includes('!node_modules/onnxruntime-node/bin/napi-v6/win32/x64/**'),
  'Linux packages must exclude foreign ONNX Runtime binaries',
);
assert.equal(
  linux.files?.includes('!node_modules/sqlite-vec-linux-x64/**'),
  false,
  'Linux x64 packages must retain sqlite-vec-linux-x64',
);
for (const foreignPackage of [
  'darwin-arm64',
  'darwin-x64',
  'windows-x64',
  'linux-arm64',
]) {
  assert.ok(
    linux.files?.includes(`!node_modules/sqlite-vec-${foreignPackage}/**`),
    `Linux x64 packages must exclude sqlite-vec-${foreignPackage}`,
  );
}

const linuxArm64 = await configFor('linux-arm64');
assert.equal(
  linuxArm64.files?.includes('!node_modules/onnxruntime-node/bin/napi-v6/linux/arm64/**'),
  false,
  'Linux arm64 packages must retain the arm64 ONNX Runtime binary',
);

const windows = await configFor('win32-x64');
assert.equal(
  windows.files?.includes('!node_modules/sqlite-vec-windows-x64/**'),
  false,
  'Windows packages must map win32-x64 to sqlite-vec-windows-x64',
);
assert.ok(
  windows.files?.includes('!node_modules/sqlite-vec-linux-x64/**'),
  'Windows packages must exclude foreign sqlite-vec extensions',
);

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};
assert.equal(
  packageJson.devDependencies['electron-builder'],
  '26.15.7',
  'Windows NSIS packaging must retain the BCJ extraction fix shipped in electron-builder 26.15.6+',
);
assert.match(
  packageJson.scripts['desktop:build:main'],
  /native-rhythm-worker\.ts.*native-rhythm-worker\.mjs/,
  'desktop build must bundle the native rhythm utility process',
);
// cutshort ships for Windows only.
for (const script of ['desktop:dist:win', 'desktop:dist:mac-x64', 'desktop:dist:linux', 'desktop:dist:local']) {
  assert.equal(packageJson.scripts[script], undefined, `${script} must not exist in a Windows-only build`);
}
const windowsDistScript = packageJson.scripts['desktop:dist'];
assert.match(windowsDistScript, /'--win','nsis','--x64'/, 'desktop:dist must build the Windows x64 installer');
assert.match(
  windowsDistScript,
  /spawnSync\(process\.execPath,\['node_modules\/electron-builder\/cli\.js'/,
  'Windows packaging must launch electron-builder through a cross-platform Node wrapper',
);
assert.match(
  windowsDistScript,
  /env:\{\.\.\.process\.env,CC_EB_TARGET:'win32-x64'\}/,
  'Windows packaging must explicitly select win32-x64 filters on every host',
);
assert.doesNotMatch(
  windowsDistScript,
  /&& electron-builder /,
  'Windows packaging must not invoke electron-builder with host-derived filters',
);
assert.match(
  windowsDistScript,
  /'--config','config\/electron-builder\.config\.mjs'/,
  'Windows packaging must pass the categorized electron-builder config path',
);

console.log('update-packaging.verify: packaging contract OK');
