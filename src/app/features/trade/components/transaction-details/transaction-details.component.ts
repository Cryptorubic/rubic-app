import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { first, map } from 'rxjs/operators';
import { OnChainTrade, TradeInfo } from 'rubic-sdk';
import { Observable, of } from 'rxjs';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { transactionInfoText } from '@features/trade/constants/transaction-info-text';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { switchIif } from '@shared/utils/utils';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent {
  public readonly text = transactionInfoText;

  public readonly trade$: Observable<CrossChainTrade | OnChainTrade> =
    this.tradeStateService.currentTrade$.pipe(first());

  public readonly details$: Observable<TradeInfo> = this.trade$.pipe(map(el => el.getTradeInfo()));

  public readonly walletAddress$ = this.targetAddressService.address$.pipe(
    switchIif(
      Boolean,
      address => of(address),
      () => this.walletConnector.addressChange$
    )
  );

  public isWalletCopied = false;

  constructor(
    private readonly tradeStateService: SwapsStateService,
    private readonly walletConnector: WalletConnectorService,
    private readonly targetAddressService: TargetNetworkAddressService,
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
}