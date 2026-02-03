import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { timeout } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-private-tokens-selector',
  templateUrl: './public-tokens-selector.component.html',
  styleUrls: ['./public-tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicTokensSelectorComponent {
  public tokensToShow: AvailableTokenAmount[] = [];

  private readonly tokensFacade = inject(TokensFacadeService);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly context = inject(POLYMORPHEUS_CONTEXT);

  constructor() {
    this.tokensFacade
      .getTokensBasedOnType(BLOCKCHAIN_NAME.POLYGON)
      .tokens$.pipe(timeout(5_000))
      .subscribe(tokens => {
        this.tokensToShow = tokens.map(token => ({
          ...token,
          available: true,
          favorite: false,
          amount: token?.amount?.isFinite() ? token.amount : new BigNumber(0)
        }));
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
