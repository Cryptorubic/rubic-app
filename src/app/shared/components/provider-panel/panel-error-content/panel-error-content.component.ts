import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { ProviderData } from 'src/app/shared/components/provider-panel/models/provider-data';

@Component({
  selector: 'app-panel-error-content',
  templateUrl: './panel-error-content.component.html',
  styleUrls: ['./panel-error-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelErrorContentComponent implements OnInit {
  /**
   * Does current provider loading.
   */
  @Input() public providerData: ProviderData;

  @Input() public errorTranslateKey: string;

  constructor() {}

  public ngOnInit(): void {
    console.log(this.providerData);
    console.log(this.errorTranslateKey);
  }
}
