use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager, Runtime,
};

pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> Result<(), tauri::Error> {
    let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
    let separator0 = tauri::menu::PredefinedMenuItem::separator(app)?;
    let restore_item = MenuItem::with_id(app, "restore", "Restore Interactive", true, None::<&str>)?;
    let toggle_ui_item = MenuItem::with_id(app, "toggle_ui", "Toggle UI", true, None::<&str>)?;
    let separator1 = tauri::menu::PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, Some("CmdOrCtrl+Q"))?;

    let menu = Menu::with_items(
        app,
        &[&show_item, &hide_item, &separator0, &restore_item, &toggle_ui_item, &separator1, &quit_item],
    )?;

    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Stellaris Desktop")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "restore" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_ignore_cursor_events(false);
                    let _ = window.emit("mode-changed", "interactive");
                    let _ = window.set_focus();
                }
            }
            "toggle_ui" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("toggle-ui", ());
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}
