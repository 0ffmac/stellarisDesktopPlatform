# Stellaris Desktop — Technical Reference

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Tauri Shell                       │
│  ┌──────────────────────────────────────────────┐   │
│  │            React 19 WebView                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  │   │
│  │  │  App.tsx  │  │  Stores  │  │  Widgets   │  │   │
│  │  │ (orchestr)│──│(Zustand) │──│(React comp)│  │   │
│  │  └────┬─────┘  └────┬─────┘  └──────┬─────┘  │   │
│  │       │              │              │         │   │
│  │  ┌────▼──────────────▼──────────────▼─────┐   │   │
│  │  │          Core Services                 │   │   │
│  │  │  DesktopService  EventBus  SettingsSvc  │   │   │
│  │  │  QualityManager  TauriIntegration       │   │   │
│  │  └──────────────────┬──────────────────────┘   │   │
│  └─────────────────────┼──────────────────────────┘   │
│                        │ IPC (invoke/events)           │
│  ┌─────────────────────▼──────────────────────────┐   │
│  │              Rust Backend                       │   │
│  │  commands.rs  tray.rs  lib.rs                  │   │
│  │  Store Plugin  Global Shortcut Plugin           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## State Management (Zustand)

| Store | Purpose | Key State |
|---|---|---|
| `useStarStore` | Star model state | `star.position`, `star.rotation`, `star.scale`, `wireframe`, `autoRotate`, `glowEnabled`, `loading`, `error` |
| `useUIStore` | UI visibility | `toolbarVisible`, `activePanel`, `contextMenuVisible` |
| `useDesktopStore` | Desktop integration | `mode` (click_through/interactive/locked), `isVisible`, `isFocused`, `isTauri` |
| `useThemeStore` | Theme state | `activeThemeId`, `activeTheme` (full `ThemeDefinition`) |
| `useSettingsStore` | Persisted settings | `settings.themeSettings`, `settings.displaySettings`, `settings.interactionSettings` |

### Store → Service Bridge

Stores call core services, never the reverse. Example:

```ts
// useDesktopStore.ts
setMode: async (mode) => {
  await desktopService.setMode(mode);  // calls TauriIntegration → Rust command
  set({ mode });                       // updates React state
},
```

## Core Services

| Service | Type | Role |
|---|---|---|
| `DesktopService` | Singleton | Desktop integration orchestrator; delegates to `TauriIntegration` |
| `TauriIntegration` | Instance | Tauri API wrapper; handles IPC calls and window listeners |
| `EventBus` | Singleton | Typed pub/sub event system for decoupled communication |
| `SettingsService` | Singleton | Settings persistence via Tauri Store plugin |
| `QualityManager` | Singleton | GPU auto-detection and quality preset selection |
| `AnimationController` | Singleton | Keyframe-based animation engine using `requestAnimationFrame` |
| `IdleAnimation` | Instance | Star floating/rotation idle animation using `AnimationController` |
| `PowerManager` | Singleton | Battery monitoring, frame-time tracking, adaptive quality control |

### Event Bus Events

| Event | Payload | Emitter | Consumers |
|---|---|---|---|
| `desktop:focus` | `void` | `DesktopService` / Tauri window listener | FpsThrottle |
| `desktop:blur` | `void` | `DesktopService` / Tauri window listener | FpsThrottle |
| `desktop:mode-change` | `string` | `DesktopService` | DesktopInteractionFeature |
| `desktop:show` | `void` | `DesktopService` | — |
| `desktop:hide` | `void` | `DesktopService` | — |
| `renderer:resize` | `{width, height}` | Tauri window listener | — |
| `theme:changed` | `string` | — | — |
| `settings:changed` | `{key, value}` | SettingsService | — |
| `star:loaded` | `void` | StarMesh | Scene |
| `app:before-quit` | `void` | — | — |

## Rust Backend

### Commands (`commands.rs`)

| Command | Args | Returns | Purpose |
|---|---|---|---|
| `get_setting` | `key: String` | `Option<Value>` | Get a setting from the store |
| `set_setting` | `key: String, value: Value` | `Result<(), String>` | Set a setting in the store |
| `get_all_settings` | — | `Value` | Get all stored settings |
| `toggle_click_through` | `enabled: bool` | `Result<(), String>` | Set `setIgnoreCursorEvents` |
| `set_interaction_mode` | `mode: String` | `Result<(), String>` | Set interaction mode (click_through/interactive/locked) |
| `get_system_info` | — | `SystemInfo` | Get platform, arch, OS version |

### Tray (`tray.rs`)

Menu items: Show | Hide | — | Restore Interactive | Toggle UI | — | Quit

All tray actions call Rust-side directly — no webview IPC needed.

### Global Shortcuts (`lib.rs`)

| Shortcut | Action |
|---|---|
| `Cmd+Shift+H` | Disable click-through, emit `mode-changed`, focus window |
| `Cmd+Shift+P` | Emit `toggle-ui` event to the webview |

Shortcuts are registered via `tauri-plugin-global-shortcut` at the OS level. The handler checks `shortcut.matches(Modifiers::SUPER | Modifiers::SHIFT, Code::KeyH)` and calls Tauri window APIs directly.

### Capabilities (`capabilities/default.json`)

Permissions granted:
- `core:default`, `core:window:default`
- Window ops: `allow-set-ignore-cursor-events`, `allow-set-always-on-top`, `allow-set-focus`, `allow-show`, `allow-hide`, `allow-close`, `allow-maximize`, `allow-unmaximize`, `allow-is-maximized`, `allow-minimize`, `allow-unminimize`
- `allow-set-size`, `allow-set-position`
- `core:tray:default`
- `store:default`, `store:allow-get`, `store:allow-set`, `store:allow-save`, `store:allow-load`

## Tauri Config (`tauri.conf.json`)

| Key | Value |
|---|---|
| `transparent` | `true` |
| `decorations` | `false` |
| `alwaysOnTop` | `true` |
| `macOSPrivateApi` | `true` |
| `resizable` | `true` |
| `backgroundColor` | `"#00000000"` |
| `width` | `800` |
| `height` | `600` |
| `minWidth` | `400` |
| `minHeight` | `300` |

## 3D Rendering Pipeline

### Render Loop

```
R3F Canvas (frameloop="demand")
    │
    ├── FpsThrottle
    │     ├── setInterval(invalidate, 33ms)  →  ~30fps (active)
    │     ├── 30s idle → 66ms (15fps)
    │     ├── Low power → 66ms (15fps) + disable glow
    │     ├── Pauses on blur/visibilitychange →  0fps
    │     └── Resumes on focus               →  ~30fps
    │
    ├── Scene
    │     ├── OrbitControls (Cmd+drag: disable rotate)
    │     ├── Environment (empty stub, extendable)
    │     ├── Lighting (ambient + 2 directional from theme)
    │     ├── PostProcessing (stub, returns null)
    │     ├── LoadingSphere (blue wireframe, shown while loading)
    │     └── StarRenderer
    │           └── StarMesh
    │                 ├── GLTFLoader → model
    │                 ├── TextureLoader → skin texture
    │                 ├── UV repair (degenerate UV detection)
    │                 ├── PBR material (roughness, metalness, emissive glow)
    │                 ├── useFrame: auto-rotation + floating offset
    │                 └── Wireframe toggle via material.wireframe
    │
    └── <Suspense> for GLTF loading
```

### StarMesh Component

The star mesh renders a GLTF model with a PBR material:

- **GLTF Loading**: `useLoader(GLTFLoader, modelUrl)` — cached by R3F
- **Texture Loading**: `useLoader(TextureLoader, textureUrl)` — cached by R3F
- **UV Repair**: Scans UV coordinates; if degenerate (uMin ≈ uMax and vMin ≈ vMax), regenerates UVs from vertex positions (X,Z → U,V)
- **Material**: `MeshStandardMaterial` with `map`, `roughness`, `metalness`, `emissive` (from theme), `emissiveIntensity` (from glow), `transparent: true`
- **Animation**: `useFrame` updates `rotation.y` (auto-rotate) and `position.y` (floating sine wave)
- **Wireframe**: `material.wireframe` toggled via `useStarStore.setWireframe()`

### Performance Design

| Strategy | Implementation |
|---|---|
| Framerate cap | `frameloop="demand"` + `setInterval(invalidate, 33)` = ~30fps |
| Idle framerate drop | 30s no interaction → 15fps, any activity restores 30fps |
| Low-power mode | Battery <20% + not charging → 15fps + disable glow |
| Frame-time tracking | 30-frame sliding window; sustained >50ms triggers low-power mode |
| Pause on hidden | `blur`/`visibilitychange` → stop `setInterval` → 0 renders |
| Resolution scaling | `dpr={[1, 2]}` — adapts to device pixel ratio (1x–2x) |
| No post-processing | `PostProcessing` returns `null` |
| Simple lighting | 3 lights (1 ambient + 2 directional), no shadows |
| No stencil buffer | `stencil: false` in Canvas GL config |
| Auto quality | `QualityManager` detects GPU, selects preset |

### `dpr` Configuration

```tsx
dpr={[1, 2]}
```

- Minimum 1x pixel ratio
- Maximum 2x pixel ratio
- R3F adjusts automatically based on screen refresh rate and system load

## Window Dragging

Manual `setPosition` via Tauri IPC with `setPointerCapture`:

1. `pointerdown` on title bar: capture pointer, read current window position
2. `pointermove`: calculate delta, call `window.setPosition(new PhysicalPosition(x, y))`
3. `pointerup`: release pointer, cleanup listeners

This approach avoids issues with `startDragging()` on transparent windows.

## Click-Through Mode

When enabled:
- Rust: `window.set_ignore_cursor_events(true)` — all mouse events pass through to the desktop
- Frontend: Viewport div gets `pointerEvents: 'none'`
- Escape hatch: Tray menu "Restore Interactive" (Rust-side, no webview required)
- Keyboard: `Cmd+Shift+H` global shortcut (OS-level, not webview-dependent)

## Immersive Mode

Hides all UI (title bar + toolbar) for a distraction-free view:

- **Toggle**: `Cmd+Shift+P` or `Cmd+Shift+B` or ⊙ button or "Toggle UI" context menu item
- **Peek**: When hidden, a small pill button appears at the top on hover to show UI
- **Hint**: Bottom-center hint reads "Right-click or double-click for menu"
- **Double-click**: Toggles UI back (if hidden) or resets star (if visible)

## Theme System

Themes are defined in `src/shared/constants/themes.ts`:

```ts
interface ThemeDefinition {
  id: string;
  name: string;
  textureId: string;
  emissiveColor: string;
  ambientColor: string;
  keyLightColor: string;
  fillLightColor: string;
}
```

The active theme drives:
- Texture selection (`skin.png` / `skin1.png` / etc.)
- Emissive glow color on the star material
- 3-point lighting colors (ambient, key, fill)

## Keyboard Shortcut Architecture

Three layers, tried in order:

| Layer | Mechanism | When it works |
|---|---|---|
| **OS global** | `tauri-plugin-global-shortcut` (Rust) | Always — even if webview has no focus or click-through is active |
| **Window listener** | `window.addEventListener('keydown', ...)` in `useWindowShortcut` | When the Tauri webview window has focus |
| **Document listener** | `document.addEventListener('keydown', ...)` in `useKeyboardShortcuts` | When the document has focus |

## Backward Compatibility Summary

| Feature | Works without Tauri? |
|---|---|
| Star rendering | Yes (falls back to browser) |
| Window dragging | No (gracefully catches error) |
| Click-Through | No |
| Tray icon | No |
| Global shortcuts | No |
| Settings persistence | No (in-memory only) |
| Window controls | No |
