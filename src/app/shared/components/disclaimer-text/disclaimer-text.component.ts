import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';

@Component({
  selector: 'app-disclaimer-text',
  templateUrl: './disclaimer-text.component.html',
  styleUrls: ['./disclaimer-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclaimerTextComponent {
  constructor(private dialog: MatDialog, private readonly translateService: TranslateService) {}

  public openDisclaimer(): void {
    const {
      'tradesPage.disclaimerTitle': title,
      'tradesPage.disclaimerText': text
    } = this.translateService.instant(['tradesPage.disclaimerTitle', 'tradesPage.disclaimerText']);
    this.dialog.open(DisclaimerComponent, {
      width: '650px',
      disableClose: true,
      data: { text, title, actions: {} }
    });
  }
}
