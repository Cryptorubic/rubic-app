import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ProviderPanelData } from '@features/instant-trade/components/providers-panels/components/provider-panel/models/provider-panel-data';

@Component({
  selector: 'app-panel-error-content',
  templateUrl: './panel-error-content.component.html',
  styleUrls: ['./panel-error-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelErrorContentComponent {
  @Input() public providerPanelData: ProviderPanelData;

  @Input() public errorTranslateKey: string;
}
