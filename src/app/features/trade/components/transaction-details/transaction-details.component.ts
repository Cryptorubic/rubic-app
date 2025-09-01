import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { distinctUntilChanged, first, map, startWith } from 'rxjs/operators';
import { OnChainTrade, TradeInfo, CrossChainTrade } from '@cryptorubic/sdk';
import { Observable } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { transactionInfoText } from '@features/trade/constants/transaction-info-text';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { isNil } from '@shared/utils/utils';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent {
  public readonly text = transactionInfoText;

  public readonly trade$: Observable<CrossChainTrade | OnChainTrade> =
    this.swapsStateService.currentTrade$.pipe(first());

  public readonly details$: Observable<TradeInfo> = this.trade$.pipe(map(el => el.getTradeInfo()));

  public readonly priceImpactCssClass$: Observable<string> = this.details$.pipe(
    map(trade => this.getPriceImpactCssClass(trade.priceImpact)),
    distinctUntilChanged(),
    startWith('')
  );

  public readonly walletAddress = this.getWalletAddress();

  public isWalletCopied = false;

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly walletConnector: WalletConnectorService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly settingsService: SettingsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public copyToClipboard(): void {
    this.isWalletCopied = true;
    setTimeout(() => {
      this.isWalletCopied = false;
      this.cdr.markForCheck();
    }, 700);
  }

  public getPriceImpactCssClass(priceImpact: number): string {
    const isUnknown = isNaN(priceImpact) || isNil(priceImpact);
    if (isUnknown || (priceImpact >= 0.01 && priceImpact < 10)) {
      return '';
    }
    if (priceImpact < 0.01) {
      return 'transaction-details__priceImpact-low';
    }
    if (priceImpact >= 10 && priceImpact < 20) {
      return 'transaction-details__priceImpact-medium';
    }
    return 'transaction-details__priceImpact-high';
  }

  private getWalletAddress(): string {
    const settings =
      this.swapsStateService.currentTrade.trade instanceof OnChainTrade
        ? this.settingsService.instantTradeValue
        : this.settingsService.crossChainRoutingValue;

    return settings.showReceiverAddress &&
      this.targetAddressService.address &&
      this.swapsStateService.currentTrade.tradeType !== 'WRAPPED'
      ? this.targetAddressService.address
      : this.walletConnector.address;
  }
}
