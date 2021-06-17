import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';

@Component({
  selector: 'app-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  public settingsComponent: PolymorpheusComponent<any, any>;

  public open: boolean;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly swapService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = this.settingsService.getSettingsComponent();
    this.swapFormService.commonTrade.valueChanges.subscribe(() => {
      this.settingsComponent = this.settingsService.getSettingsComponent();
    });
  }
}
