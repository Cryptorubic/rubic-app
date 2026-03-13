import { Injectable, inject } from '@angular/core';
import { Token as SdkToken } from '@cryptorubic/core';
import { Observable, first, forkJoin, map } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashTokensService } from './privacycash-tokens.service';

@Injectable()
export class PrivacycashPrivateTokensFacadeService extends TokensFacadeService {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return forkJoin([
      this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(first()),
      this.privacycashTokensService.tokens$.pipe(first())
    ]).pipe(
      map(([rubicTokens, privacycashTokens]) => {
        const rubicTokensMap = rubicTokens.reduce(
          (acc, token) => ({ ...acc, [this.getKey(token)]: token }),
          {} as Record<string, AvailableTokenAmount>
        );
        return privacycashTokens.map(pcTokenWithBalance => {
          const rubicToken = rubicTokensMap[this.getKey(pcTokenWithBalance)];
          const amount = SdkToken.fromWei(pcTokenWithBalance.balanceWei, rubicToken.decimals);
          return { ...rubicToken, amount };
        });
      })
    );
  }

  private getKey(token: MinimalToken): string {
    return `${token.blockchain}::${token.address.toLowerCase()}`;
  }
}
