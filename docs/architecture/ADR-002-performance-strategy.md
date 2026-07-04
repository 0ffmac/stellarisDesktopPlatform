# ADR-002: Performance Strategy

**Status:** Accepted ✅  
**Date:** 2026-07-05  
**Context:** The app renders a 3D scene continuously. On a MacBook Air M4 16GB, full 120Hz rendering caused high CPU/GPU usage and thermal issues.

## Decision

| Strategy | Implementation | Detail |
|---|---|---|
| Framerate cap | `frameloop="demand"` + `setInterval(invalidate, 33ms)` | ~30fps target, no renders between frames |
| Pause on hidden | `blur` / `visibilitychange` → stop interval | Zero GPU usage when minimized or on another space |
| Idle detection | 30s no interaction → drop to 15fps (`LOW_POWER_FRAMERATE_MS`) | Mouse/keyboard activity resets timer |
| Battery monitoring | `navigator.getBattery()` | <20% + not charging → 15fps + disable glow |
| Frame time tracking | 30-frame sliding window | Sustained >50ms frames → trigger low-power mode |
| DPR scaling | `dpr={[1, 2]}` (1x–2x adaptive) | Low power mode forces `scaledDpr = 1` |
| No post-processing | `PostProcessing` returns `null` | Zero overhead from bloom/SSAO |
| Simple lighting | 1 ambient + 2 directional, no shadows | Cheap lighting, no shadow maps |

## Consequences
- Smooth floating animation at 30fps looks fine for a slow-moving star
- Battery and frame monitoring adds ~0.1ms overhead per interval tick
- Glow is the first visual feature sacrificed on low power
- No visible transition when throttling between 30fps/15fps (star motion is subtle)
