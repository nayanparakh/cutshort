# Import security audit

Source: https://github.com/0xsline/OpenChatCut at commit
`c7136c0fbe61b6dddc397d008b1c75a4bacb7c61` (2026-10-20). The source was cloned into
a quarantine folder with git hooks disabled. Nothing was installed or executed
before these checks passed. Audit date: 2026-10-21.

## Result

No malware, obfuscated code, credential theft or data-exfiltration code was found.

## Checks performed

| Check | Result |
| --- | --- |
| Microsoft Defender scan of the full checkout | No threats |
| Executables or scripts in the repo (`.exe`, `.dll`, `.ps1`, `.bat`, `.vbs`) | None |
| Binary files | Fonts, images, audio, LUTs, one Silero VAD `.onnx` model and the onnxruntime-web `.wasm` |
| Root `preinstall` / `install` / `postinstall` hooks | None |
| `predev` / `prebuild` downloads | whisper.cpp from `github.com/ggml-org` and MediaPipe models from `storage.googleapis.com`, each pinned by size and SHA-256 |
| `eval` / `new Function` | One use: the motion-graphics template sandbox, gated by a forbidden-pattern validator |
| Obfuscation (`_0x…`, long base64 or hex blobs, `fromCharCode` chains) | None |
| Exfiltration endpoints (webhooks, Telegram, pastebin, ngrok, …) | None |
| Credential, wallet or browser-profile access | None |
| Download-and-execute shell patterns | None. The one PowerShell use writes the user's own MCP token to a user environment variable when "connect Codex" is clicked. |
| Contacted hosts | Only documented AI, stock-media and publishing APIs; each is used only when configured |
| Lockfile sources | 28 packages resolved from `registry.npmmirror.com`; all 28 have the same integrity hash as `registry.npmjs.org` |
| npm registry signatures (`npm audit signatures`) | All 816 installed packages verified |
| Dependency install scripts | esbuild, ffmpeg-static (official GitHub release b6.1.1), onnxruntime-node, koffi, protobufjs, electron-winstaller. Run only after the checks above. |
| Defender scan of downloaded binaries (whisper-cli, ffmpeg) | No threats |

## Changes made because of the audit

- `report_user_friction`: the agent prompt told the model to record "silent product
  telemetry" and never mention it. The data stayed in localStorage, but the hidden
  instruction is removed.
- Update checks and auto-update pointed at the upstream repository, which would have
  let a third party ship installers to cutshort users. They now read only
  `nayanparakh/cutshort`, set in `shared/release-repository.ts`. A test checks that
  the installer's publish target matches it.
- The online extension registry (`openchatcut.com`) is off by default.
- Non-breaking `npm audit fix` removed the critical advisory (proxy-addr) and
  several high ones.

## Known remaining risk

- `npm audit --omit=dev` reports 3 high and 6 moderate advisories. The highs are
  `sharp` (libheif) and `adm-zip`, both pulled in through `@huggingface/transformers` /
  `onnxruntime-node`. Fixing them needs a dependency upgrade.
- The agent's skill runner (`server/plugins/skill-exec.ts`) can run whitelisted
  interpreters (`node`, `python`, `bash`) on scripts inside an installed skill's
  folder. Install skills only from sources you trust.
- AI providers you enable receive the media and prompts you send them.
