# ADR-001: Technology Stack

**Status:** Accepted ✅  
**Date:** 2026-07-05  
**Context:** Need a cross-platform desktop app that renders a transparent 3D star overlay on the user's wallpaper.

## Decision

| Layer | Choice | Rationale |
|---|---|---|
| Desktop Shell | Tauri v2 | Smaller binary than Electron, Rust backend, native window APIs (transparent, always-on-top, tray) |
| Frontend | React 19 + TypeScript 5.6 | Modern, typed, hooks-first |
| 3D Rendering | Three.js r185 + R3F v9 + Drei v10 | Declarative 3D, react-three-fiber ecosystem, PBR support |
| State | Zustand v5 | Minimal boilerplate, works outside React (for core services) |
| Styling | TailwindCSS v4 | Utility-first, fast iteration |
| Build | Vite 7 + Vitest | Fast dev server, native ESM |
| Persistence | tauri-plugin-store | JSON-backed, async, Rust-native |
| Global Shortcuts | tauri-plugin-global-shortcut | OS-level shortcuts, works when webview has no focus |

## Consequences
- Tauri v2 + R3F v9 + React 19 compatibility was a risk — resolved by using exact version pins
- macOS Private API needed for transparent always-on-top window
- Manual `setPosition` drag instead of `startDragging()` due to transparent window limitations
