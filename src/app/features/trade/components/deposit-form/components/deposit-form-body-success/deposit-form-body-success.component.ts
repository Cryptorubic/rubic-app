import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { DepositFormManager } from '../../services/deposit-form-manager';
import { DEPOSIT_STEP_ORDER } from '../../models/deposit-step-order';
import { blockchainScanner } from '@app/shared/constants/blockchain/blockchain-scanner';
import { find, first, forkJoin, map, Observable, startWith } from 'rxjs';
import { CrossChainDepositData } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { DepositTrade } from '@app/features/trade/models/deposit-trade';
import { ShortAddressPipe } from '@app/shared/pipes/short-address.pipe';
import { ShortenAmountPipe } from '@app/shared/pipes/shorten-amount.pipe';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';
import { ON_CHAIN_PROVIDERS } from '@app/features/trade/constants/on-chain-providers';
import { OnChainTradeType } from '@cryptorubic/core';
import { BridgeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { msToFriendlyTime } from '@app/shared/components/timer/utils/ms-to-friendly-time';

interface RowConfig {
  key: string;
  value: string;
  valueTextColor?: string;
}

@Component({
  selector: 'app-deposit-form-body-success',
  standalone: false,
  templateUrl: './deposit-form-body-success.component.html',
  styleUrl: './deposit-form-body-success.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('appearFromBottom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate(
          '320ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ])
  ]
})
export class DepositFormBodySuccessComponent {
  @Input() durationMs: number = 0;

  public readonly finalTradeDetails$: Observable<RowConfig[]> = forkJoin([
    this.depositFormManager.tradeStatus$.pipe(find(status => !!status.dstHash)),
    this.depositFormManager.depositTrade$.pipe(first())
  ]).pipe(
    map(([statusData, depositTrade]) => this.getDetailsArray(statusData, depositTrade)),
    startWith([])
  );

  public readonly explorerLink$ = this.depositFormManager.tradeStatus$.pipe(
    map(status => this.getExplorerLink(status.dstHash)),
    startWith('')
  );

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly depositFormManager: DepositFormManager
  ) {}

  public startNewExchange(): void {
    this.depositFormManager.cleanup();
    this.tradePageService.setState('form');
  }

  public getDetailsArray(
    statusData: CrossChainDepositData,
    depositTrade: DepositTrade
  ): RowConfig[] {
    const providerUiName =
      depositTrade.fromToken.blockchain === depositTrade.toToken.blockchain
        ? ON_CHAIN_PROVIDERS[depositTrade.tradeType as OnChainTradeType]?.name || 'Unknown'
        : BRIDGE_PROVIDERS[depositTrade.tradeType as BridgeType]?.name || 'Unknown';

    return [
      {
        key: 'You sent',
        value: depositTrade.fromAmount
      },
      {
        key: 'You received',
        value: new ShortenAmountPipe().transform(depositTrade.toAmount.toFixed(), 12, 6),
        valueTextColor: '#39E180'
      },
      {
        key: 'Transaction',
        value: new ShortAddressPipe().transform(statusData.dstHash, 6, 4),
        valueTextColor: 'var(--tui-text-secondary)'
      },
      {
        key: 'Trade ID',
        value: new ShortAddressPipe().transform(depositTrade.id, 6, 4)
      },
      {
        key: 'Provider',
        value: providerUiName
      },
      {
        key: 'Duration',
        value: msToFriendlyTime(this.durationMs)
      }
    ];
  }

  public getExplorerLink(dstTxHash: string): string {
    const detailsStep =
      this.depositFormManager.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    const dstChain = detailsStep.depositDetails.dstToken.blockchain;
    const scannerConfig = blockchainScanner[dstChain];
    const link = `${scannerConfig.baseUrl}${scannerConfig.TRANSACTION}${dstTxHash}`;
    return link;
  }
}
