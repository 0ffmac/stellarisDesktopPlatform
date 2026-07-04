# Stellaris Desktop — User Guide

## Getting Started

### Installation

```bash
pnpm install        # Install JS dependencies
pnpm tauri dev      # Run in development mode with hot-reload
pnpm tauri build    # Build production .app / .dmg
```

After `pnpm tauri build`, the app is in:
- `src-tauri/target/release/bundle/macos/Stellaris Desktop.app`
- `src-tauri/target/release/bundle/dmg/Stellaris Desktop.dmg`

### First Launch

1. Open the app — you'll see a 3D star floating on a transparent window
2. The window is **always-on-top** by default, sitting on top of your wallpaper
3. **Drag the title bar** (slight white bar at top) to move the window anywhere

---

## Interface Overview

```
┌──────────────────────────────────────────────────┐
│  STELLARIS · Interactive    ⊙  −  □  ✕          │  ← Title Bar
├──────────────────────────────────────────────────┤
│                                  ◇ ⟳ ⟲ ◇ 🔓 ⚙ │  ← Toolbar
│                                                  │
│                                                  │
│                   ★  (3D Star)                    │
│                                                  │
│                                                  │
│          Right-click or double-click              │  ← Hint (immersive)
│                  for menu                         │
└──────────────────────────────────────────────────┘
```

### Title Bar

The thin (32px) semi-transparent bar at the top:

| Element | Action |
|---|---|
| **STELLARIS** label | Shows current mode: Interactive / Click-Through / Locked |
| **Drag area** | Click and drag anywhere on the title bar (except buttons) to move the window |
| **⊙** button | Toggle UI on/off (immersive mode) |
| **−** button | Minimize window to Dock |
| **□** button | Toggle maximize (fill screen) |
| **✕** button | Close the app |

### Toolbar

Floating bar centered below the title bar:

| Button | Label | Action |
|---|---|---|
| **◇** | Theme | Opens theme picker (grid of color swatches) |
| **⟳** | Rotate / Pause | Toggle star auto-rotation |
| **⟲** | Reset | Reset star position and theme to defaults |
| **◇** | Wireframe / Solid | Toggle between solid and wireframe rendering |
| **🔓 / 🔒** | Free / Lock | Toggle click-through mode (mouse passes through window) |
| **⚙** | Settings | Open settings panel |

### Context Menu

Right-click anywhere on the canvas to open:

| Option | Action |
|---|---|
| **Reset View** | Reset star position + reload classic theme |
| **Toggle UI** | Show/hide title bar and toolbar |
| **Toggle Click-Through** | Enable/disable click-through mode |
| **Settings** | Open settings panel |
| *separator* | |
| **Minimize** | Minimize window to Dock |
| **Maximize** | Toggle maximize |
| **Close** | Quit the app |

---

## Modes

### Interactive Mode (default)
- Mouse clicks interact with the app
- Right-click for context menu
- Cmd+drag to move the star
- OrbitControls to rotate the view

### Click-Through Mode
- All mouse clicks pass through to the desktop underneath
- The star is visible but non-interactive
- The toolbar shows 🔒
- **To exit**: `Cmd+Shift+H` (global shortcut) or tray icon → "Restore Interactive"

### Locked Mode
- Mouse events are consumed but the star cannot be moved
- (Partially implemented)

---

## Window Controls

### Move
Drag the title bar (top 32px of the window).

### Resize
Drag any edge or corner of the window (the resize cursor appears on hover).

### Minimize / Maximize / Close
- Title bar buttons ( − □ ✕ )
- Context menu (right-click → Minimize / Maximize / Close)

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+Shift+H` | Toggle click-through mode on/off |
| `Cmd+Shift+R` | Reset star position + set Classic Lantern theme |
| `Cmd+Shift+P` | Toggle UI (title bar + toolbar) on/off |
| `Cmd+Shift+B` | Toggle UI (backup shortcut) |
| `Escape` | Close context menu or settings panel |

All shortcuts work globally — they function even when the webview has no focus.

---

## Immersive Mode

**Hide all UI** for a distraction-free view:

1. Press `Cmd+Shift+P` (or click ⊙, or right-click → "Toggle UI")
2. The title bar and toolbar disappear
3. A small **⌃ Show UI** pill appears at the very top on hover — click it to bring the UI back
4. A hint at the bottom reads "Right-click or double-click for menu"
5. **Double-click** on the star toggles the UI back
6. Press `Cmd+Shift+P` or `Cmd+Shift+B` again to restore the UI

---

## Tray Icon

The app puts an icon in the macOS menu bar. Right-click it for:

| Menu Item | Action |
|---|---|
| **Show** | Show and focus the window |
| **Hide** | Hide the window |
| *separator* | |
| **Restore Interactive** | Force-disable click-through mode (escape hatch) |
| **Toggle UI** | Show/hide title bar and toolbar |
| *separator* | |
| **Quit** | Exit the application |

The tray is your **ultimate escape hatch** — it works at the OS level, independent of the webview.

---

## Themes

1. Click the **◇** button in the toolbar
2. A grid of color swatches appears
3. Click a swatch to apply that theme

Each theme changes:
- The star's **texture** (skin image)
- The **emissive glow** color
- The **3-point lighting** (ambient, key, fill)

---

## Tips

- **Move the star**: Hold `Cmd` and drag the star
- **Rotate the view**: Click and drag (not on the star) with OrbitControls
- **Reset everything**: `Cmd+Shift+R` or right-click → "Reset View"
- **Performance**: The app throttles to 30fps and pauses when hidden (minimize or switch spaces)

## Troubleshooting

| Issue | Solution |
|---|---|
| Tray icon not visible | Check behind the notch on MacBooks; right-click the Stellaris icon in the menu bar |
| Can't exit click-through | `Cmd+Shift+H` (global shortcut), or tray → "Restore Interactive" |
| Star not loading | Check console for GLTF/texture loading errors; verify `public/assets/models/Star.glb` exists |
| Window won't move | Drag only the title bar (top 32px), not the buttons |
| High CPU usage | The app pauses when hidden (minimize/blur) — ensure it's not stuck rendering |
| Keyboard shortcuts not working | Try `Cmd+Shift+B` as backup for UI toggle; shortcuts work globally via Rust plugin |
