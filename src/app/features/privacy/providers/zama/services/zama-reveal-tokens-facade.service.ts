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

@Injectable()
export class ZamaRevealFacadeService extends TokensFacadeService {
  private readonly tokensService = inject(ZamaTokensService);

  private readonly balanceService = inject(ZamaBalanceService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.balanceService.balances$.pipe(
      switchMap(shieldedBalances => {
        const supportedTokensMapping = this.tokensService.supportedTokensMapping;

        return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
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
