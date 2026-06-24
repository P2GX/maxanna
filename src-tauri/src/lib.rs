pub mod maxanna;



use ontolius::ontology::OntologyTerms;
use tauri::{AppHandle, Emitter, Runtime, WindowEvent};
use tauri_plugin_dialog::{DialogExt};
use std::{collections::HashMap, fs, sync::{Arc, Mutex}};
use tauri_plugin_fs::{init};
use ga4ghphetools::tauri::{get_full_path_as_str, load_ontology, OntologyLoadEvent};
use crate::maxanna::MaxAnnaSingleton;

struct AppState {
    maxanna: Mutex<MaxAnnaSingleton>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        maxanna: Mutex::new(MaxAnnaSingleton::new()),
    });

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())     
        .invoke_handler(tauri::generate_handler![
            load_hpo,
            load_maxo
        ])
        .setup(|app| {
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                window.emit("close-requested", ()).unwrap_or_default();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}








/// Load the Human Phenotype Ontology (HPO)
#[tauri::command]
async fn load_hpo(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let state_handle = state.inner().clone(); 
    let app_handle = app.clone();

    // Notify Angular that HPO is loading
    let _ = app.emit("hpo-load-event", OntologyLoadEvent::loading());

    tauri::async_runtime::spawn(async move {
        match app_handle.dialog().file().blocking_pick_file() {
            Some(file) => {
                match get_full_path_as_str(file) {
                    Ok(hpo_json_path) => {
                        match load_ontology(&hpo_json_path) {
                            Ok(ontology) => {
                                let mut singleton = state_handle.maxanna.lock().unwrap();
                                let n_terms = ontology.len();
                                singleton.set_hpo(ontology, &hpo_json_path);
                                let _ = app_handle.emit("hpo-load-event", OntologyLoadEvent::success("HPO loaded".to_string(), n_terms));
                            },
                            Err(_) => { 
                                let _ = app_handle.emit("hpo-load-event", OntologyLoadEvent::cancel());
                            }
                        }
                    },
                    Err(e) => {
                        let _ = app_handle.emit("hpo-load-event", OntologyLoadEvent::error(e));
                    }
                }
            },
            None => {
                let _ = app_handle.emit("hpo-load-event", OntologyLoadEvent::error("User canceled HPO loading".to_string()));
            },
        };
    });
    Ok(())
}

/// Load the Medical Action Ontology (MAXO)
/// 
#[tauri::command]
async fn load_maxo(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let state_handle = state.inner().clone(); 
    let app_handle = app.clone();
    /* 
    // Notify Angular that MAXO is loading
    let _ = app.emit("maxo-load-event", OntologyLoadEvent::loading());

    tauri::async_runtime::spawn(async move {
        match app_handle.dialog().file().blocking_pick_file() {
            Some(file) => {
                match get_full_path_as_str(file) {
                    Ok(maxo_json_path) => {
                        match ontology_loader::load_maxo_ontology(&maxo_json_path) {
                            Ok(ontology) => {
                                let mut singleton = state_handle.phenoboard.lock().unwrap();
                                singleton.set_maxo(Arc::new(ontology), &maxo_json_path);
                                
                                let _ = app_handle.emit("maxo-load-event", OntologyLoadEvent::success(singleton.get_maxo_status()));
                            },
                            Err(_) => { 
                                let _ = app_handle.emit("maxo-load-event", OntologyLoadEvent::cancel());
                            }
                        }
                    },
                    Err(e) => {
                        let _ = app_handle.emit("maxo-load-event", OntologyLoadEvent::error(e));
                    }
                }
            },
            None => {
                let _ = app_handle.emit("maxo-load-event", OntologyLoadEvent::error("User canceled MAXO loading".to_string()));
            },
        };
    });
    */
    Ok(())
}