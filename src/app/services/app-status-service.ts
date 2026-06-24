import { Injectable, signal, inject, NgZone, computed } from '@angular/core';
import { listen } from '@tauri-apps/api/event';
import { StatusDto, defaultStatusDto } from '../models/status_dto';
import { invoke } from '@tauri-apps/api/core';
import { ask } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from "@tauri-apps/api/window";

@Injectable({ providedIn: 'root' })
export class AppStatusService {

  
  readonly state = signal<StatusDto>(defaultStatusDto());


}