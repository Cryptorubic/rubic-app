import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';

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
    private readonly swapService: SwapsService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = this.settingsService.getSettingsComponent();
    this.swapService.availableTokens.subscribe(() => {
      this.settingsComponent = this.settingsService.getSettingsComponent();
    });
  }
}
