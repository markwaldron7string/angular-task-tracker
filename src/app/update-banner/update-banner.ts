import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UpdateCheckerService } from '../update-checker.service';

@Component({
  selector: 'app-update-banner',
  templateUrl: './update-banner.html',
  styleUrl: './update-banner.css',
})
export class UpdateBanner implements OnInit, OnDestroy {
  private updateChecker = inject(UpdateCheckerService);

  updateAvailable = this.updateChecker.updateAvailable;

  ngOnInit() {
    this.updateChecker.start();
  }

  ngOnDestroy() {
    this.updateChecker.stop();
  }

  reload() {
    this.updateChecker.reloadApp();
  }

  dismiss() {
    this.updateChecker.dismissUpdate();
  }
}
