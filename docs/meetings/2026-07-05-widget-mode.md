# 2026-07-05 — macOS Background Widget Mode

**Type:** Feature work  
**Participants:** Client + Lead

## What was done

- **Close-to-tray**: Changed `CloseRequested` handler in `src-tauri/src/lib.rs` to call `api.prevent_close()` + `window.hide()` — closing the window hides to tray instead of quitting.

- **macOS LSUIElement**: Added `"dist"` script to `package.json` that patches the built `.app` bundle's `Info.plist` with `LSUIElement = true`, making the app a pure background app (no Dock icon, no menu bar).

- **Build**: `pnpm dist` now produces a fully configured `.app` bundle at `src-tauri/target/release/bundle/macos/Stellaris Desktop.app`.

## How to launch

```bash
open "src-tauri/target/release/bundle/macos/Stellaris Desktop.app"
```

## Next steps

- 🟡 Windows/Linux builds may need equivalent `LSUIElement`-style config (e.g., `SW_HIDE` on Windows)  
