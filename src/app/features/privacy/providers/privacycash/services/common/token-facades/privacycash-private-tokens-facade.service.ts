import { Injectable, inject } from '@angular/core';
import { Token as SdkToken } from '@cryptorubic/core';
import { Observable, first, forkJoin, map } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashTokensService } from './privacycash-tokens.service';
import { MinimalTokenWithBalance } from '../../../models/privacycash-tokens-facade-models';
import { compareTokens } from '@app/shared/utils/utils';

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
        // address is rubic supported(native is So11111111111111111111111111111111111111111)
        const pcTokensMap = privacycashTokens.reduce(
          (acc, token) => ({ ...acc, [this.getKey(token)]: token }),
          {} as Record<string, MinimalTokenWithBalance>
        );
        // @TODO_1767 inputValue всегда пустой нужно чекать токены селектора из другого места
        const oppositeSelectedToken =
          direction === 'from' ? inputValue.toToken : inputValue.fromToken;

        return rubicTokens
          .filter(token => {
            const pcTokenFound = !!pcTokensMap[this.getKey(token)];
            return pcTokenFound && !compareTokens(token, oppositeSelectedToken);
          })
          .map(token => {
            const pcTokenWithBalance = pcTokensMap[this.getKey(token)];
            const amount = SdkToken.fromWei(pcTokenWithBalance.balanceWei, token.decimals);
            return { ...token, amount };
          });
      })
    );
  }

  private getKey(token: MinimalToken): string {
    return `${token.blockchain}::${token.address.toLowerCase()}`;
  }
}
