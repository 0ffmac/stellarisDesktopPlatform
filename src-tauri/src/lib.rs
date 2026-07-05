mod commands;
mod tray;

use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, ShortcutState};
use tauri_plugin_store::StoreExt;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state != ShortcutState::Pressed {
                        return;
                    }
                    if shortcut.matches(Modifiers::SUPER | Modifiers::SHIFT, Code::KeyH) {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.set_ignore_cursor_events(false);
                            let _ = window.emit("mode-changed", "interactive");
                            let _ = window.set_focus();
                        }
                    }
                    if shortcut.matches(Modifiers::SUPER | Modifiers::SHIFT, Code::KeyP) {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("toggle-ui", ());
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            let store = app.store("settings.json")?;
            let _ = store.reload();

            tray::create_tray(app.handle())?;

            let _ = app.global_shortcut().register("CmdOrCtrl+Shift+H");
            let _ = app.global_shortcut().register("CmdOrCtrl+Shift+P");

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_setting,
            commands::set_setting,
            commands::get_all_settings,
            commands::toggle_click_through,
            commands::set_interaction_mode,
            commands::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Stellaris Desktop");
}
