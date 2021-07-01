import { Component, ChangeDetectionStrategy, OnInit, Injector } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SettingsItComponent } from 'src/app/features/swaps/components/settings-it/settings-it.component';
import { SettingsBridgeComponent } from 'src/app/features/swaps/components/settings-bridge/settings-bridge.component';

@Component({
  selector: 'app-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  public settingsComponent: PolymorpheusComponent<
    SettingsItComponent | SettingsBridgeComponent,
    Injector
  >;

  public open: boolean;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly swapService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = this.getSettingsComponent();
    this.swapFormService.commonTrade.valueChanges.subscribe(() => {
      this.settingsComponent = this.getSettingsComponent();
    });
  }

  public getSettingsComponent(): PolymorpheusComponent<
    SettingsItComponent | SettingsBridgeComponent,
    Injector
  > {
    const control = this.swapFormService.commonTrade.controls.input.value;
    return control.fromBlockchain === control.toBlockchain
      ? new PolymorpheusComponent(SettingsItComponent)
      : new PolymorpheusComponent(SettingsBridgeComponent);
  }
}
