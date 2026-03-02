import { map, Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';

import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BlockchainName, BlockchainsInfo, compareAddresses, Token } from '@cryptorubic/core';
import { BalanceControllerService } from '@features/privacy/providers/railgun/services/balance-controller/balance-controller.service';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';

export class RailgunTokensFacadeService extends TokensFacadeService {
  private readonly balanceController = inject(BalanceControllerService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.balanceController.balancesSnapshot$.pipe(
      switchMap(snapshot => {
        const availableTokensForBlockchains = snapshot.Spendable.erc20Amounts;
        const blockchainName = BlockchainsInfo.getBlockchainNameById(snapshot.Spendable.chain.id);
        const isBlockchain = BlockchainsInfo.isBlockchainName(type);

        if (direction === 'to') {
          return this.tokensBuilderService
            .getTokensList(isBlockchain ? type : blockchainName, _query, direction, inputValue)
            .pipe(
              map(tokens => {
                return tokens.map(token => {
                  const balance = availableTokensForBlockchains.find(availableToken =>
                    compareAddresses(availableToken.tokenAddress, token.address)
                  )?.amount;

                  return {
                    ...token,
                    amount: balance
                      ? Token.fromWei(balance.toString(), token.decimals)
                      : new BigNumber(0)
                  };
                });
              })
            );
        }

        return this.tokensBuilderService
          .getTokensList(isBlockchain ? type : blockchainName, _query, direction, inputValue)
          .pipe(
            map(tokens => {
              return tokens
                .filter(token => {
                  const blockchain = token.blockchain as BlockchainName;
                  const isAvailable =
                    availableTokensForBlockchains.some(availableToken =>
                      compareAddresses(availableToken.tokenAddress, token.address)
                    ) && blockchain === blockchainName;
                  return isAvailable;
                })
                .map(token => {
                  const balance = availableTokensForBlockchains.find(availableToken =>
                    compareAddresses(availableToken.tokenAddress, token.address)
                  )?.amount;

                  return {
                    ...token,
                    amount: Token.fromWei(balance.toString(), token.decimals) || token.amount
                  };
                });
            })
          );
      })
    );
  }
}
