import { Component, computed, inject, NgZone, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OrcidDialogComponent } from 'ng-hpo-uikit';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import {MatCheckboxModule } from '@angular/material/checkbox'
import { openUrl } from '@tauri-apps/plugin-opener';
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, FormsModule, MatCheckboxModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {



  private router= inject(Router);
  private dialog = inject(MatDialog);

  private ngZone = inject(NgZone);
  private cancelMessage = signal<string | null>(null);



  hpoMessage = computed(() => {
   // const s = this.statusService.state();
    const cancel = this.cancelMessage();
   // if (s.hpoLoaded) {
    //  return `${s.hpoVersion} (${s.nHpoTerms})` || "Loaded";
   // }
   // if (this.statusService.hpoLoading()) return "Loading hp.json ...";
    if (cancel) return cancel;
    return "uninitialized";
  });

  templateFileMessage = computed(()=> {
   // const path = this.statusService.state().ptTemplatePath;
   const path = "na"
    return path ? path : this.NOT_INIT;
  });
  NOT_INIT = "not initialized";
  jsonTemplateFileMessage = signal(this.NOT_INIT);

  //ptTemplateLoaded = computed(() => !!this.statusService.state().ptTemplatePath);
    ptTemplateLoaded = false;
  
  // Updated by checkbox in front end, should we update outdated HPO loabels upon import of Excel legacy files?
  updateLabels = false;
  
  newTemplateMessage = this.NOT_INIT;
 
  data = "?";

  progressValue = 0;
  isRunning = false;

  //readonly biocuratorOrcid = computed(() => this.statusService.state().biocuratorOrcid);
 
    biocuratorOrcid = signal("na");

  async loadHpo(): Promise<void> {
    
    
  }

  // select an Excel file with a cohort of phenopackets
  async chooseExistingTemplateFile(): Promise<void> {
    try {
      this.isRunning = true;
     //  const data = await this.configService.loadPtExcelTemplate(this.updateLabels);
      this.isRunning = false;
      if (this.data == null) {
        const errorMessage = "Could not retrieve template (null error)"
      //   this.notificationService.showError(errorMessage);
        return;
      }
      this.clearData();
      this.resetBackend();  
     //  this.cohortService.setCohortData(data);
      this.router.navigate(['/pttemplate']);
      } catch (error: unknown) {
        const errorMessage = String(error);
       //  this.notificationService.showError(errorMessage);
      }
    }


  /* After loading HPO, we may create a new template (new cohort) */
  async createNewPhetoolsTemplate(): Promise<void> {
  //   this.cohortService.clearCohortData();
    this.resetBackend();
   //  await this.configService.resetPtTemplate();
    await this.router.navigate(['/newtemplate']);
  }


  setBiocuratorOrcid(): void {
    const dialogRef = this.dialog.open(OrcidDialogComponent, {
      width: '500px',
      disableClose: true, 
      data: { 
        currentOrcid: this.biocuratorOrcid()
      }
    });

    // this subscribes to the @output/emit of the dialog and opens
    // the ORCID website in the system browser
    dialogRef.componentInstance.externalLinkClicked.subscribe((url: string) => {
      this.handleExternalNavigation(url);
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      // If the user cancelled or cleared the input, exit cleanly
      if (!result) return;

      // Update the reactive signal state
      this.biocuratorOrcid.set(result);
    });
  }

  // launch the link in the user's default browser
  private async handleExternalNavigation(url: string): Promise<void> {
    await openUrl(url);
  }

  async chooseJsonTemplateFile(): Promise<void> {
  
    try {
      this.isRunning = true;
    //   const data = await this.configService.loadPtJson();
       this.isRunning = false;
       const data = "?";
      if (data == null) {
        const errorMessage = "Could not retrieve JSON template (null error)"
      //   this.notificationService.showError(errorMessage);
        return;
      }
      this.clearData();
      this.resetBackend();
     //  this.cohortService.setCohortData(data);
      this.router.navigate(['/pttemplate']);
      } catch (error: unknown) {
        const errorMessage = String(error);
      //    this.notificationService.showError(errorMessage);
      }
  }

  openExternalTemplate(): void {
    this.clearData();
    this.resetBackend();
    this.router.navigate(['/tableeditor']);
  }

  /** Clear existing datasets, e.g., when we move to a new template */
  clearData(): void {
   //  this.cohortService.clearCohortData();
  //   this.pmidService.clearAllPmids();
  //   this.newTemplateMessage = this.NOT_INIT;
  //   this.jsonTemplateFileMessage.set(this.NOT_INIT);
  }

  resetBackend(): void {
   // this.configService.resetPtTemplate();
   // this.ageService.clearSelectedTerms();
  }

}
