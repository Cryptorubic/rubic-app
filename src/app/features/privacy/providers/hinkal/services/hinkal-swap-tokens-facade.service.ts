import { inject, Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalBalanceService } from './hinkal-sdk/hinkal-balance.service';
import { AssetListType } from '@app/features/trade/models/asset';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { map, Observable, switchMap } from 'rxjs';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { BlockchainsInfo, compareAddresses, EvmBlockchainName, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PrivateSwapWindowService } from '../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { compareTokens } from '@app/shared/utils/utils';
import { sorterByChain } from '@app/features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';

@Injectable()
export class HinkalSwapTokensFacadeService extends TokensFacadeService {
  private readonly balanceService = inject(HinkalBalanceService);

  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.balanceService.balances$.pipe(
      switchMap(shieldedBalances => {
        return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
          map((tokens: BalanceToken[]) => {
            return tokens.filter(token =>
              HINKAL_SUPPORTED_CHAINS.includes(token.blockchain as EvmBlockchainName)
            );
          }),
          map(tokens => {
            const supportedTokens = tokens
              .filter(token =>
                PRIVATE_MODE_SUPPORTED_TOKENS[token.blockchain]?.includes(token.address)
              )
              .map(token => {
                const shieldedBalance = shieldedBalances[
                  token.blockchain as EvmBlockchainName
                ]?.find(balance => compareAddresses(balance.tokenAddress, token.address));

                const oppositeToken =
                  direction === 'from'
                    ? this.privateSwapWindowService.swapInfo.toAsset
                    : this.privateSwapWindowService.swapInfo.fromAsset;
                const isAvailable = oppositeToken ? !compareTokens(token, oppositeToken) : true;

                return {
                  ...token,
                  available: isAvailable,
                  amount: shieldedBalance
                    ? Token.fromWei(shieldedBalance.amount, token.decimals)
                    : new BigNumber(NaN)
                };
              });

            const sortedByOpposite = supportedTokens.sort((a, b) => {
              const oppositeToken =
                direction === 'from'
                  ? this.privateSwapWindowService.swapInfo.toAsset
                  : this.privateSwapWindowService.swapInfo.fromAsset;
              if (oppositeToken) {
                if (
                  compareAddresses(a.address, oppositeToken.address) &&
                  a.blockchain === oppositeToken.blockchain
                ) {
                  return 1;
                }
                if (
                  compareAddresses(b.address, oppositeToken.address) &&
                  b.blockchain === oppositeToken.blockchain
                ) {
                  return -1;
                }
              }

              return 0;
            });
            if (BlockchainsInfo.isBlockchainName(type)) {
              return sortedByOpposite.sort(sorterByChain);
            }

            return sortedByOpposite;
          })
        );
      })
    );
  }
}
