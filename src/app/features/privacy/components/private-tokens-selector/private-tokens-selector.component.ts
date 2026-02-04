import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BLOCKCHAIN_NAME, BlockchainName, compareAddresses, Token } from '@cryptorubic/core';
import { timeout } from 'rxjs/operators';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-private-tokens-selector',
  templateUrl: './private-tokens-selector.component.html',
  styleUrls: ['./private-tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateTokensSelectorComponent {
  public tokensToShow: AvailableTokenAmount[] = [];

  private readonly tokensFacade = inject(TokensFacadeService);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly context = inject(POLYMORPHEUS_CONTEXT);

  constructor() {
    this.tokensFacade
      .getTokensBasedOnType(BLOCKCHAIN_NAME.POLYGON)
      .tokens$.pipe(timeout(5_000))
      .subscribe(tokens => {
        const balances = this.context.data;

        this.tokensToShow = balances.reduce(
          (
            tokensWithBalances: AvailableTokenAmount[],
            balanceToken: {
              address: string;
              amount: string;
              blockchain: BlockchainName;
            }
          ) => {
            const trueToken = tokens.find(t => compareAddresses(t.address, balanceToken.address));
            if (trueToken) {
              return [
                ...tokensWithBalances,
                {
                  ...trueToken,
                  amount: Token.fromWei(balanceToken.amount, trueToken.decimals),
                  favorite: false,
                  available: true
                }
              ];
            }
          },
          [] as AvailableTokenAmount[]
        );
        this.cdr.detectChanges();
      });
  }

  public selectAssetList(_value: unknown): void {}

  public selectToken(value: AvailableTokenAmount): void {
    this.context.completeWith(value);
  }

  public switchMode(): void {}

  public onTokensQuery(_value: unknown): void {}
}
