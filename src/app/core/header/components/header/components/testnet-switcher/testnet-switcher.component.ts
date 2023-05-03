import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { TestnetService } from '@core/services/testnet/testnet.service';

@Component({
  selector: 'app-testnet-switcher',
  templateUrl: './testnet-switcher.component.html',
  styleUrls: ['./testnet-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestnetSwitcherComponent {
  public readonly enableTestnets$ = this.testnetService.enableTestnets$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly testnetService: TestnetService,
    private readonly headerStore: HeaderStore
  ) {}

  /**
   * Toggles theme on dark or light.
   */
  public switchState(): void {
    this.testnetService.switchTestnetState();
  }
}
