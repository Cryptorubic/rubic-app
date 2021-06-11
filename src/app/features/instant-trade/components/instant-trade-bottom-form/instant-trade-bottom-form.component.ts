import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { NewUiDataService } from 'src/app/features/new-ui/new-ui-data.service';

@Component({
  selector: 'app-instant-trade-bottom-form',
  templateUrl: './instant-trade-bottom-form.component.html',
  styleUrls: ['./instant-trade-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantTradeBottomFormComponent {
  public providerControllers: ProviderControllerData[];

  constructor(public readonly store: NewUiDataService) {}
}
