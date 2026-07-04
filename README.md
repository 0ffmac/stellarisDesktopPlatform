# Stellaris Desktop

A premium celestial desktop experience — a 3D star floating on your wallpaper. Built with Tauri v2, React 19, Three.js (R3F v9), and TypeScript.

## Features

- **3D Star Renderer** — PBR-lit, animated star with auto-rotation and floating idle motion
- **Desktop Integration** — Transparent, frameless, always-on-top window that blends into your wallpaper
- **Click-Through Mode** — Pass mouse events through to the desktop underneath
- **Window Dragging** — Drag the title bar to reposition the window
- **Theme System** — Multiple color themes with emissive glow
- **Wireframe Toggle** — Switch between solid and wireframe rendering
- **Immersive Mode** — Hide all UI for a distraction-free view (Cmd+Shift+P or Cmd+Shift+B)
- **Right-Click Context Menu** — Reset view, toggle UI, toggle click-through, settings, minimize, maximize, close
- **Tray Icon** — Show/Hide, Restore Interactive, Toggle UI, Quit
- **Keyboard Shortcuts** — Global OS-level shortcuts via `tauri-plugin-global-shortcut`
- **Performance** — 30fps throttle with `frameloop="demand"`, pauses on blur/minimize
- **Auto Quality Detection** — GPU-aware quality presets (low/medium/high/ultra)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

The built app will be at `src-tauri/target/release/bundle/`.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+Shift+H` | Toggle click-through mode |
| `Cmd+Shift+R` | Reset star position and theme |
| `Cmd+Shift+P` | Toggle UI (title bar + toolbar) |
| `Cmd+Shift+B` | Toggle UI (backup shortcut) |
| `Escape` | Close context menu / settings panel |

*Shortcuts work globally via the `global-shortcut` Rust plugin — they function even when the webview has no focus.*

## Tray Icon Menu

Right-click the tray icon (menu bar) for:

- **Show** — Show and focus the window
- **Hide** — Hide the window
- **Restore Interactive** — Disable click-through mode (escape hatch)
- **Toggle UI** — Show/hide the title bar and toolbar
- **Quit** — Exit the application

## Window Controls

- **Title bar** — Drag to move the window
- **Buttons** — ⊙ Toggle UI | − Minimize | □ Maximize | ✕ Close
- **Context menu** — Right-click anywhere for Minimize / Maximize / Close

## Project Structure

```
src/
├── app/              App.tsx — root component, keyboard shortcuts, context menu
├── core/             Business logic (singleton services)
│   ├── animation/    AnimationController, IdleAnimation
│   ├── desktop/      DesktopService, TauriIntegration
│   ├── events/       EventBus (typed pub/sub)
│   ├── graphics/     QualityManager (GPU auto-detection)
│   └── settings/     SettingsService (persistence via Tauri Store)
├── entities/         Domain models (StarConfig, CameraService, ScenePresets)
├── features/         Feature modules (DesktopInteractionFeature, ScreenshotFeature)
├── shared/           Reusable UI, hooks, types, constants, utils
│   ├── constants/    Defaults, theme definitions
│   ├── hooks/        useKeyboardShortcuts, usePointerCapture
│   ├── types/        TypeScript types (star, theme, settings, renderer, plugin)
│   ├── ui/           ContextMenu, ErrorBoundary
│   └── utils/        debounce, math helpers
├── stores/           Zustand stores (useStarStore, useUIStore, useDesktopStore, useThemeStore, useSettingsStore)
├── types/            Three.js JSX type augmentation (three-elements.d.ts)
└── widgets/          React components
    ├── title-bar/    TitleBar (drag, window controls, immersive peek)
    ├── toolbar/      Toolbar (theme picker, rotate, wireframe, lock, settings)
    ├── viewport/     Viewport (R3F Canvas), Scene, StarMesh, Environment, Lighting, PostProcessing
    └── settings-panel/ SettingsPanel
```

## Architecture

**Feature-Sliced Design** — The codebase is organized into layers with strict dependency direction:

```
app → features → widgets → entities / shared / stores → core
```

- **app**: Root composition, keyboard shortcuts, event listeners
- **core**: Singleton services with no React dependency
- **stores**: Zustand state adapters bridging core services to React
- **widgets**: React components, one per directory, ≤300 lines
- **shared**: Utilities, hooks, types, UI primitives

## Key Technical Details

- **Window**: `transparent: true`, `decorations: false`, `alwaysOnTop: true`, `macOSPrivateApi: true`
- **Rendering**: R3F Canvas with `frameloop="demand"`, 30fps throttle via `setInterval`, pauses on `blur`/`visibilitychange`
- **Star Model**: GLTF loaded via `useLoader(GLTFLoader)`, UV repair for degenerate meshes, PBR material with emissive glow
- **Window Drag**: Manual `setPosition` via Tauri IPC with `setPointerCapture` for smooth tracking
- **Click-Through**: `window.setIgnoreCursorEvents(bool)` via Tauri Rust command
- **Persistence**: Tauri Store plugin (`settings.json`) via `SettingsService`
- **Global Shortcuts**: `tauri-plugin-global-shortcut` for OS-level `Cmd+Shift+H` and `Cmd+Shift+P`

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Tauri v2 (Rust) |
| Frontend | React 19, TypeScript 5.6 |
| 3D Rendering | Three.js r185, R3F v9, Drei v10 |
| State | Zustand v5 |
| Styling | TailwindCSS v4 |
| Build | Vite 7, Vitest |
| Persistence | Tauri Plugin Store |
| Global Shortcuts | tauri-plugin-global-shortcut |
| Package Manager | pnpm |

## Commands

```bash
pnpm dev           # Tauri development (hot-reload)
pnpm build         # TypeScript check + Vite build
pnpm tauri build   # Production bundle
pnpm typecheck     # TypeScript check only
pnpm test          # Vitest
pnpm lint          # ESLint
pnpm format        # Prettier
pnpm clean         # Remove dist/ and target/
```

## Project Documentation

See the [docs/](./docs/) directory for structured project documentation:
- [Project Overview](./docs/project/OVERVIEW.md)
- [Roadmap](./docs/project/ROADMAP.md)
- [Architecture Decisions](./docs/architecture/)
- [Meeting Notes](./docs/meetings/)
- [Sprint Progress](./docs/sprints/current/)
- [Pending Decisions](./docs/decisions/un-reviewed/)
