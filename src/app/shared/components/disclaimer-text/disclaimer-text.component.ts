import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';

@Component({
  selector: 'app-disclaimer-text',
  templateUrl: './disclaimer-text.component.html',
  styleUrls: ['./disclaimer-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclaimerTextComponent {
  constructor(private dialog: MatDialog) {}

  public openDisclaimer(): void {
    this.dialog.open(DisclaimerComponent, {
      width: '650px',
      disableClose: true,
      data: {
        text: 'DISCLAIMERS.START.TEXT',
        title: 'DISCLAIMERS.START.TITLE',
        actions: {}
      }
    });
  }
}
