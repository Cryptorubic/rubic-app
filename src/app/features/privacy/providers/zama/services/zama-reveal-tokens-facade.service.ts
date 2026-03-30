import { inject, Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ZamaTokensService } from './zama-sdk/zama-tokens.service';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { map, Observable, switchMap } from 'rxjs';
import { compareAddresses, EvmBlockchainName, Token } from '@cryptorubic/core';
import { ZamaBalanceService } from './zama-sdk/zama-balance.service';
import BigNumber from 'bignumber.js';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';

@Injectable()
export class ZamaRevealFacadeService extends TokensFacadeService {
  private readonly tokensService = inject(ZamaTokensService);

  private readonly balanceService = inject(ZamaBalanceService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.balanceService.balances$.pipe(
      switchMap(shieldedBalances => {
        const supportedTokensMapping = this.tokensService.supportedTokensMapping;

        return this.tokensBuilderService
          .getTokensList(type, _query, direction, getEmptySwapFormInput())
          .pipe(
            map(tokens => {
              const supportedTokens = tokens
                .filter(({ blockchain, address }) => {
                  const shieldedTokens = supportedTokensMapping[blockchain as EvmBlockchainName];
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
                    decimals: 6, // zama erc7984 token wrappers have 6 decimals
                    amount: shieldedBalance
                      ? Token.fromWei(shieldedBalance.amount, 6)
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
