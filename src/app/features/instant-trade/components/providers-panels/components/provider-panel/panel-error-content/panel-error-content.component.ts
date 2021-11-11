import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProviderData } from '@features/instant-trade/components/providers-panels/components/provider-panel/models/provider-data';

@Component({
  selector: 'app-panel-error-content',
  templateUrl: './panel-error-content.component.html',
  styleUrls: ['./panel-error-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelErrorContentComponent {
  /**
   * Does current provider loading.
   */
  @Input() public providerData: ProviderData;

  @Input() public errorTranslateKey: string;

  constructor() {}
}
