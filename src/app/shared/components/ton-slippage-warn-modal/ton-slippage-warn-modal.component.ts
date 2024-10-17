import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { compareAddresses, Token, TonOnChainTrade } from 'rubic-sdk';

interface TxStep {
  img: string;
  symbol: string;
}

@Component({
  selector: 'app-ton-slippage-warn-modal',
  templateUrl: './ton-slippage-warn-modal.component.html',
  styleUrls: ['./ton-slippage-warn-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TonSlippageWarnModalComponent {
  public readonly slippagePercent: number;

  public readonly transitTokens: string;

  public readonly routingPath: TxStep[];

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { trade: TonOnChainTrade }>,
    private readonly tokensStoreService: TokensStoreService
  ) {
    this.slippagePercent = this.context.data.trade.slippageTolerance * 100;
    this.transitTokens = this.getTransitSymbols();
    this.routingPath = this.getRoutingPath();
  }

  public confirm(): void {
    this.context.completeWith(true);
  }

  public cancel(): void {
    this.context.completeWith(false);
  }

  private getRoutingPath(): TxStep[] {
    const path = this.context.data.trade.getTradeInfo().routePath;
    const routingPath = [] as TxStep[];

    for (let i = 0; i < path.length; i++) {
      const isFirstStep = i === 0;
      const step = path[i];
      const from = step.path[0];
      const to = step.path[1];

      if (isFirstStep) {
        const fromTokenImg = this.getTokenImage(from);
        const toTokenImg = this.getTokenImage(to);
        routingPath.push(
          { img: fromTokenImg, symbol: from.symbol },
          { img: toTokenImg, symbol: to.symbol }
        );
      } else {
        const toTokenImg = this.getTokenImage(to);
        routingPath.push({ img: toTokenImg, symbol: to.symbol });
      }
    }

    return routingPath;
  }

  private getTokenImage(token: Token): string {
    return this.tokensStoreService.tokens.find(
      t => compareAddresses(t.address, token.address) && t.blockchain === token.blockchain
    ).image;
  }

  private getTransitSymbols(): string {
    const path = this.context.data.trade.getTradeInfo().routePath;
    if (path.length === 1) return '';

    const joinedTransitSymbols = path
      .slice(0, -1)
      .map(step => step.path[1].symbol)
      .join(' or ');

    return joinedTransitSymbols;
  }
}
