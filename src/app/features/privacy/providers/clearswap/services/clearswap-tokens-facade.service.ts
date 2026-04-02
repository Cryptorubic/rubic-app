import { inject, Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import {
  sorterByChain,
  sorterByBalance
} from '@app/features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { distinctObjectUntilChanged } from '@app/shared/utils/distinct-object-until-changed';
import { compareTokens } from '@app/shared/utils/utils';
import { BlockchainsInfo } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { Observable, map } from 'rxjs';
import { isClearswapSupportedChain } from '../constants/clearswap-supported-chains';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';

@Injectable()
export class ClearswapTokensFacadeService extends TokensFacadeService {
  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  public getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.getTokensBasedOnType(type).tokens$.pipe(
      distinctObjectUntilChanged(),
      map((tokens: BalanceToken[]) => {
        return tokens.filter(
          token =>
            isClearswapSupportedChain(token.blockchain) &&
            PRIVATE_MODE_SUPPORTED_TOKENS[token.blockchain].includes(token.address)
        );
      }),
      map((tokens: BalanceToken[]) => {
        const mappedTokens = tokens.map(token => {
          const oppositeToken =
            direction === 'from'
              ? this.privateSwapWindowService.swapInfo.toAsset
              : this.privateSwapWindowService.swapInfo.fromAsset;
          const isAvailable = oppositeToken ? !compareTokens(token, oppositeToken) : true;
          return {
            ...token,
            available: isAvailable,
            amount: token?.amount?.gt(0) ? token.amount : new BigNumber(NaN)
          };
        });

        const sortedByOpposite = mappedTokens.sort((a, b) => {
          const oppositeToken =
            direction === 'from'
              ? this.privateSwapWindowService.swapInfo.toAsset
              : this.privateSwapWindowService.swapInfo.fromAsset;
          if (oppositeToken) {
            if (a.address === oppositeToken.address && a.blockchain === oppositeToken.blockchain) {
              return 1;
            }
            if (b.address === oppositeToken.address && b.blockchain === oppositeToken.blockchain) {
              return -1;
            }
          }

          return 0;
        });
        if (BlockchainsInfo.isBlockchainName(type)) {
          return sortedByOpposite.sort(sorterByChain);
        }
        if (type === 'allChains') {
          return sortedByOpposite.sort(sorterByBalance);
        }
        return sortedByOpposite;
      })
    );
  }
}
