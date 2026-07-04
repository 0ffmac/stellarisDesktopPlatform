# Decision Pending: Platform Expansion

**Date:** 2026-07-05  
**Status:** ⏳ Awaiting client decision  

## Context
Desktop MVP (Sprint 001) is complete and working. The client wants to explore running the star on additional platforms beyond desktop macOS.

## Options

### Option A — TV Christmas Page 🎄
**Effort:** 2–3 hours  
**Description:** Standalone HTML file with embedded Three.js + star GLTF model (base64). Load on any smart TV browser, go fullscreen. Add snow particles, auto-cycle themes, auto-hide cursor.  
**Pros:** Zero dependencies, works on any TV with a browser, no app store needed, perfect for Christmas.  
**Cons:** No interactivity (remote control navigation limited), no offline fallback beyond first load.  

### Option B — iPhone PWA 📱
**Effort:** 1 day  
**Description:** Progressive Web App with offline service worker, splash screen, standalone mode. Star fills the screen. Uses `wakeLock` to keep screen on.  
**Pros:** No app store, works on any iOS Safari, good performance with WebGL.  
**Cons:** Not "floating" — the user opens the app to see it. Can't overlay other apps.  

### Option C — Android Floating Overlay 🤖
**Effort:** 1 week  
**Description:** React Native app with expo-gl, rendering the star. Requests `SYSTEM_ALERT_WINDOW` permission for floating overlay (like Messenger chat heads).  
**Pros:** True floating experience — star hovers over other apps. Cross-platform RN code.  
**Cons:** Requires App Store + Play Store distribution. Significantly more complex.  

### Option D — Windows/Linux Build Test 🖥️
**Effort:** 1 hour  
**Description:** Build the existing Tauri project on Windows and Linux, fix platform-specific issues (tray icon, window positioning, global shortcuts).  
**Pros:** Low effort, validates cross-platform claim.  
**Cons:** Less exciting than new features.  

## Recommendation
Start with Option A (TV page) — highest impact for the holidays, lowest effort, no app store friction. Follow with Option B (PWA) for iPhone reach. Delay Option C (Android overlay) pending client feedback on the TV/PWA adoption.
