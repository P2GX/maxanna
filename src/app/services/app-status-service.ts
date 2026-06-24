import { Injectable, signal, inject, NgZone, computed } from '@angular/core';
import { listen } from '@tauri-apps/api/event';
import { StatusDto, defaultStatusDto } from '../models/status_dto';
import { invoke } from '@tauri-apps/api/core';
import { ask } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from "@tauri-apps/api/window";
import { NotificationService } from 'ng-hpo-uikit';
  import { WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppStatusService {

  private ngZone = inject(NgZone);
  private notificationService = inject(NotificationService);

  hpoLoaded = signal<boolean>(false);
  maxoLoaded = signal<boolean>(false);
  hpoVersion = signal<string>('');
  maxoVersion = signal<string>('');
  hpoJsonPath = signal<string>('');
  nHpoTerms = signal<number>(0);
  nMaxoTerms = signal<number>(0);
  hpoLoading = signal<boolean>(false);
  maxoLoading = signal<boolean>(false);
  biocuratorOrcid = signal<string>('');

  // Global Error tracking can be contextualized or kept simple
  errorMessage = signal<string>('');
  hasError = computed(() => !!this.errorMessage());

    constructor() {
      this.setupListeners();
    }




 private async setupListeners() {
  // Bind the HPO Stream
  await this.registerOntologyListener({
    channel: 'hpo-load-event',
    loadingSignal: this.hpoLoading,
    loadedSignal: this.hpoLoaded,
    versionSignal: this.hpoVersion,
    countSignal: this.nHpoTerms,
    errorContext: 'HPO'
  });

  // Bind the MAXO Stream 
  await this.registerOntologyListener({
    channel: 'maxo-load-event',
    loadingSignal: this.maxoLoading,
    loadedSignal: this.maxoLoaded,
    versionSignal: this.maxoVersion,
    countSignal: this.nMaxoTerms,
    errorContext: 'MAXO'
  });
}

/**
 * Registers a generic Tauri event listener for ontology loading
 */
private async registerOntologyListener(config: {
  channel: string;
  loadingSignal: WritableSignal<boolean>;
  loadedSignal: WritableSignal<boolean>;
  versionSignal: WritableSignal<string>;
  countSignal: WritableSignal<number>;
  errorContext: string;
}) {
  await listen(config.channel, (event) => {
    const { status, payload } = event.payload as { 
      status: 'loading' | 'success' | 'error' | 'cancel';
      payload?: string | { statusMessage?: string; errorMessage?: string }; 
    };

    this.ngZone.run(() => {
      switch (status) {
        case 'loading':
          config.loadingSignal.set(true);
          this.errorMessage.set('');
          break;

        case 'success':
          config.loadingSignal.set(false);
          config.loadedSignal.set(true);
          
          const versionInfo = typeof payload === 'object' ? payload?.statusMessage : payload;
          config.versionSignal.set(versionInfo || 'Loaded');
          break;

        case 'error':
          config.loadingSignal.set(false);
          const errorMsg = typeof payload === 'object' ? payload?.errorMessage : payload;
          this.errorMessage.set(`[${config.errorContext}] ${errorMsg || 'Failed to parse'}`);
          this.notificationService.showError(this.errorMessage());
          break;

        case 'cancel':
          config.loadingSignal.set(false);
          break;
      }
    });
  });
}

    

}