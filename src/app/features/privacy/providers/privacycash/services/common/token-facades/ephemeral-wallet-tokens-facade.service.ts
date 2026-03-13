import { Injectable, inject } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { Observable, first, forkJoin, map } from 'rxjs';
import { Token as SdkToken } from '@cryptorubic/core';
import { EphemeralWalletTokensService } from './ephemeral-wallet-tokens.service';

@Injectable()
export class EphemeralWalletTokensFacadeService extends TokensFacadeService {
  private readonly ephemeralWalletTokensService = inject(EphemeralWalletTokensService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return forkJoin([
      this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(first()),
      this.ephemeralWalletTokensService.tokens$.pipe(first())
    ]).pipe(
      map(([rubicTokens, ethemeralWalletTokens]) => {
        const rubicTokensMap = rubicTokens.reduce(
          (acc, token) => ({ ...acc, [this.getKey(token)]: token }),
          {} as Record<string, AvailableTokenAmount>
        );
        return ethemeralWalletTokens.map(ephemeralWalletToken => {
          const rubicToken = rubicTokensMap[this.getKey(ephemeralWalletToken)];
          const amount = SdkToken.fromWei(ephemeralWalletToken.balanceWei, rubicToken.decimals);
          return { ...rubicToken, amount };
        });
      })
    );
  }

  private getKey(token: MinimalToken): string {
    return `${token.blockchain}::${token.address.toLowerCase()}`;
  }
}
