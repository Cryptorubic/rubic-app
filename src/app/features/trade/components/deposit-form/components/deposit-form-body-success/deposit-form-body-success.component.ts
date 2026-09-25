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
import { msToMinsSecs } from '@app/shared/components/timer/utils/ms-to-friendly-time';

export type RowConfig = {
  key: string;
} & (
  | { type: 'span'; value: string; valueTextColor?: string }
  | { type: 'link'; visibleText: string; linkUrl: string }
  | { type: 'copy-btn'; visibleText: string; textToCopy: string }
);

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
    this.depositFormManager.depositTrade$.pipe(first()),
    this.depositFormManager.exchangeDuration$.pipe(first())
  ]).pipe(
    map(([statusData, depositTrade, durationMs]) =>
      this.getDetailsArray(statusData, depositTrade, durationMs)
    ),
    startWith([])
  );

  public readonly exchangeDuration$ = this.depositFormManager.exchangeDuration$;

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
    depositTrade: DepositTrade,
    _durationMs: number
  ): RowConfig[] {
    const providerUiName =
      depositTrade.fromToken.blockchain === depositTrade.toToken.blockchain
        ? ON_CHAIN_PROVIDERS[depositTrade.tradeType as OnChainTradeType]?.name || 'Unknown'
        : BRIDGE_PROVIDERS[depositTrade.tradeType as BridgeType]?.name || 'Unknown';

    return [
      {
        type: 'span',
        key: 'Sent',
        value: `${depositTrade.fromAmount} ${depositTrade.fromToken.symbol}`
      },
      {
        type: 'span',
        key: 'Received',
        value: `${new ShortenAmountPipe().transform(depositTrade.toAmount.toFixed(), 12, 6)} ${depositTrade.toToken.symbol}`,
        valueTextColor: '#39E180'
      },
      {
        type: 'link',
        key: 'Transaction Hash',
        visibleText: new ShortAddressPipe().transform(statusData.dstHash, 6, 4),
        linkUrl: this.getExplorerLink(statusData.dstHash)
      },
      {
        type: 'copy-btn',
        key: 'Swap ID',
        visibleText: new ShortAddressPipe().transform(depositTrade.id, 6, 6),
        textToCopy: depositTrade.id
      },
      {
        type: 'span',
        key: 'Provider',
        value: providerUiName
      },
      {
        type: 'span',
        key: 'Duration',
        value: msToMinsSecs(this.durationMs)
      }
    ];
  }

  private getExplorerLink(dstTxHash: string): string {
    const detailsStep =
      this.depositFormManager.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    const dstChain = detailsStep.depositDetails.dstToken.blockchain;
    const scannerConfig = blockchainScanner[dstChain];
    const link = `${scannerConfig.baseUrl}${scannerConfig.TRANSACTION}${dstTxHash}`;
    return link;
  }
}
