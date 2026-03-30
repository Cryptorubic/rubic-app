import { inject, Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalBalanceService } from './hinkal-sdk/hinkal-balance.service';
import { AssetListType } from '@app/features/trade/models/asset';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { map, Observable, switchMap } from 'rxjs';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { compareAddresses, EvmBlockchainName, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';

@Injectable()
export class HinkalRevealFacadeService extends TokensFacadeService {
  private readonly balanceService = inject(HinkalBalanceService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.balanceService.balances$.pipe(
      switchMap(shieldedBalances => {
        return this.tokensBuilderService
          .getTokensList(type, _query, direction, getEmptySwapFormInput())
          .pipe(
            map(tokens => {
              const supportedTokens = tokens
                .filter(token =>
                  PRIVATE_MODE_SUPPORTED_TOKENS[token.blockchain]?.includes(token.address)
                )
                .filter(({ blockchain, address }) => {
                  const shieldedTokens = shieldedBalances[blockchain as EvmBlockchainName];
                  return (
                    shieldedTokens &&
                    shieldedTokens.find(token => compareAddresses(token.tokenAddress, address))
                  );
                })
                .map(token => {
                  const shieldedBalance = shieldedBalances[
                    token.blockchain as EvmBlockchainName
                  ]?.find(balance => compareAddresses(balance.tokenAddress, token.address));

                  return {
                    ...token,
                    amount: shieldedBalance
                      ? Token.fromWei(shieldedBalance.amount, token.decimals)
                      : new BigNumber(NaN)
                  };
                });

              return supportedTokens;
            })
          );
      })
    );
  }
}
