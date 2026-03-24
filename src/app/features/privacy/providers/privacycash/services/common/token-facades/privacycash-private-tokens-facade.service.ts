import { Injectable, inject } from '@angular/core';
import { Token as SdkToken } from '@cryptorubic/core';
import { Observable, first, forkJoin, map } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashTokensService } from './privacycash-tokens.service';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { Web3Pure } from '@cryptorubic/web3';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';

@Injectable()
export class PrivacycashPrivateTokensFacadeService extends TokensFacadeService {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return forkJoin([
      this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(first()),
      this.privacycashTokensService.tokens$.pipe(first()),
      this.privateSwapWindowService.swapInfo$.pipe(first())
    ]).pipe(
      map(([rubicTokens, privacycashTokens, swapInfo]) => {
        const rubicTokensMap = rubicTokens.reduce(
          (acc, token) => ({ ...acc, [this.getKey(token)]: token }),
          {} as Record<string, AvailableTokenAmount>
        );
        return privacycashTokens
          .filter(
            pcToken =>
              !!rubicTokensMap[this.getKey(pcToken)] &&
              this.filterToken(pcToken, direction, swapInfo)
          )
          .map(pcTokenWithBalance => {
            const rubicToken = rubicTokensMap[this.getKey(pcTokenWithBalance)];
            const amount = SdkToken.fromWei(pcTokenWithBalance.balanceWei, rubicToken.decimals);
            return { ...rubicToken, amount };
          });
      })
    );
  }

  private filterToken(
    token: MinimalToken,
    direction: 'from' | 'to',
    swapInfo: PrivateSwapInfo
  ): boolean {
    const oppositeToken = direction === 'from' ? swapInfo.toAsset : swapInfo.fromAsset;
    if (!oppositeToken) return true;
    const isOppositeNative = Web3Pure.isNativeAddress(
      oppositeToken.blockchain,
      oppositeToken.address
    );
    return isOppositeNative
      ? !Web3Pure.isNativeAddress(token.blockchain, token.address)
      : Web3Pure.isNativeAddress(token.blockchain, token.address);
  }

  private getKey(token: MinimalToken): string {
    return `${token.blockchain}::${token.address.toLowerCase()}`;
  }
}
