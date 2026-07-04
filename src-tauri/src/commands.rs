use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub os_version: String,
}

#[tauri::command]
pub fn get_setting<R: Runtime>(app: AppHandle<R>, key: String) -> Result<Option<Value>, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    Ok(store.get(&key))
}

#[tauri::command]
pub fn set_setting<R: Runtime>(app: AppHandle<R>, key: String, value: Value) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    store.set(&key, value);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_all_settings<R: Runtime>(app: AppHandle<R>) -> Result<Value, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let entries = store.entries();
    let map = entries
        .iter()
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect::<serde_json::Map<_, _>>();
    Ok(Value::Object(map))
}

#[tauri::command]
pub async fn toggle_click_through<R: Runtime>(
    app: AppHandle<R>,
    enabled: bool,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window
            .set_ignore_cursor_events(enabled)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn set_interaction_mode<R: Runtime>(
    app: AppHandle<R>,
    mode: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        match mode.as_str() {
            "click_through" => {
                window
                    .set_ignore_cursor_events(true)
                    .map_err(|e| e.to_string())?;
            }
            "interactive" | "locked" => {
                window
                    .set_ignore_cursor_events(false)
                    .map_err(|e| e.to_string())?;
            }
            _ => {}
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        os_version: std::env::consts::OS.to_string(),
    }
}
