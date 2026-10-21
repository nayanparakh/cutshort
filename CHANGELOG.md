# Changelog

## 0.1.0 (unreleased)

First cutshort release, derived from OpenChatCut 0.2.17
(commit c7136c0fbe61b6dddc397d008b1c75a4bacb7c61). Upstream history:
https://github.com/0xsline/OpenChatCut/blob/main/CHANGELOG.md

- Renamed OpenChatCut to cutshort (UI, environment variables `CUTSHORT_*`, data
  directory `~/.cutshort`, MCP server name `cutshort`).
- Windows-only: `desktop:dist` builds the Windows x64 NSIS installer, and the macOS
  and Linux packaging scripts and release workflow are removed.
- Local-first AI: the agent defaults to Ollama (`qwen3:8b`) instead of a cloud
  provider.
- Update checks and desktop auto-update read GitHub Releases of
  `nayanparakh/cutshort` (`shared/release-repository.ts`).
- The online extension registry is off unless `VITE_RESOURCE_REGISTRY_URL` is set.
- Removed the upstream author's contact popover. The GitHub icon opens the cutshort repo.
- `report_user_friction` is no longer hidden from the user (it was already
  local-only).
- Dependencies: applied non-breaking `npm audit fix`.
