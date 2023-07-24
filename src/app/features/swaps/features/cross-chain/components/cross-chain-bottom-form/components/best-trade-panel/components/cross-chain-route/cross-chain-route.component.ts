import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import { ProviderInfo } from '@features/swaps/shared/models/trade-provider/provider-info';
import { centralizedBridges } from '@features/swaps/shared/constants/trades-providers/centralized-bridges';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { Theme } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-cross-chain-route',
  templateUrl: './cross-chain-route.component.html',
  styleUrls: ['./cross-chain-route.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainRouteComponent {
  public get leftColor(): string {
    return this.handleThemeColor(this.fromProvider.color);
  }

  public get rightColor(): string {
    return this.handleThemeColor(this.toProvider.color);
  }

  @Input() theme: Theme;

  @Input() set route(routing: CrossChainRoute) {
    this.bridgeProvider = CrossChainRouteComponent.getRoute(
      routing.bridgeProvider,
      routing.bridgeProvider,
      true
    );
    this.fromProvider = CrossChainRouteComponent.getRoute(
      routing?.fromProvider,
      routing.bridgeProvider,
      Boolean(routing?.fromProvider)
    );
    this.toProvider = CrossChainRouteComponent.getRoute(
      routing?.toProvider,
      routing.bridgeProvider,
      Boolean(routing?.toProvider)
    );
  }

  public static getRoute(
    provider: TradeProvider,
    bridgeProvider: TradeProvider,
    allowCentralized: boolean
  ): ProviderInfo {
    const isCentralizedBridge = centralizedBridges.some(
      centralizedBridge => centralizedBridge === bridgeProvider
    );

    return !provider
      ? {
          ...TRADES_PROVIDERS[bridgeProvider],
          name: isCentralizedBridge
            ? TRADES_PROVIDERS[bridgeProvider].name
            : `${TRADES_PROVIDERS[bridgeProvider].name}`
        }
      : {
          ...TRADES_PROVIDERS[provider],
          ...(isCentralizedBridge && {
            name: `${TRADES_PROVIDERS[provider].name}${allowCentralized ? ' (Centralized)' : ''}`
          })
        };
  }

  public fromProvider: ProviderInfo;

  public bridgeProvider: ProviderInfo;

  public toProvider: ProviderInfo;

  constructor() {}

  private isBlackColor(sourceColor: string): boolean {
    const color = sourceColor.toLowerCase();
    return color === '#000' || color === 'black' || color === '#000000';
  }

  private isWhiteColor(sourceColor: string): boolean {
    const color = sourceColor.toLowerCase();
    return color === '#fff' || color === 'white' || color === '#ffffff';
  }

  public handleThemeColor(color: string): string {
    const isBlackLine = this.isBlackColor(color);
    const isWhiteLine = this.isWhiteColor(color);

    if (this.theme === 'dark' && isBlackLine) {
      return 'white';
    }

    if (this.theme === 'light' && isWhiteLine) {
      return 'black';
    }

    return color;
  }
}
