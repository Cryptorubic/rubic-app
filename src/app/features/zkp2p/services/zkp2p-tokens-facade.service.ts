import { Injectable } from '@angular/core';
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
import { BlockchainsInfo } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { Observable, map } from 'rxjs';
import { isZkp2pSupportedChain } from '../constants/supported-chains';

@Injectable()
export class Zkp2pTokensFacadeService extends TokensFacadeService {
  public getTokensList(
    type: AssetListType,
    _query: string,
    _direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.getTokensBasedOnType(type).tokens$.pipe(
      distinctObjectUntilChanged(),
      map((tokens: BalanceToken[]) => {
        return tokens.filter(
          token =>
            isZkp2pSupportedChain(token.blockchain) &&
            (token.symbol === 'USDC' || token.symbol === 'USDT')
        );
      }),
      map((tokens: BalanceToken[]) => {
        const mappedTokens = tokens.map(token => {
          return {
            ...token,
            available: true,
            amount: token?.amount?.gt(0) ? token.amount : new BigNumber(NaN)
          };
        });

        if (BlockchainsInfo.isBlockchainName(type)) {
          return mappedTokens.sort(sorterByChain);
        }
        if (type === 'allChains') {
          return mappedTokens.sort(sorterByBalance);
        }
        return mappedTokens;
      })
    );
  }
}
