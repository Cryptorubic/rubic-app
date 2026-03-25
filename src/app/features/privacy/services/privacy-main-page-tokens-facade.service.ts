import { inject, Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
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
import { PrivacyMainPageService } from './privacy-main-page.service';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '../constants/private-mode-supported-tokens';
import { isPrivateModeSupportedChain } from '../constants/private-mode-supported-chains';

@Injectable()
export class PrivacyMainPageTokensFacadeService extends TokensFacadeService {
  private readonly privacyMainPageService = inject(PrivacyMainPageService);

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
            isPrivateModeSupportedChain(token.blockchain) &&
            PRIVATE_MODE_SUPPORTED_TOKENS[token.blockchain].includes(token.address)
        );
      }),
      map((tokens: BalanceToken[]) => {
        const mappedTokens = tokens.map(token => {
          const oppositeToken =
            direction === 'from'
              ? this.privacyMainPageService.swapInfo.toAsset
              : this.privacyMainPageService.swapInfo.fromAsset;
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
              ? this.privacyMainPageService.swapInfo.toAsset
              : this.privacyMainPageService.swapInfo.fromAsset;
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
