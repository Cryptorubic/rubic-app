import { map, Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';

import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BlockchainsInfo, compareAddresses, Token } from '@cryptorubic/core';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { RailgunSupportedChain } from '@features/privacy/providers/railgun/constants/network-map';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export class RailgunRevealFacadeService extends TokensFacadeService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.railgunFacade.balancesSnapshot$.pipe(
      switchMap(event => {
        const isBlockchain = BlockchainsInfo.isBlockchainName(type);

        if (isBlockchain) {
          const blockchain = type as RailgunSupportedChain;
          const availableTokensForBlockchains = event[blockchain].Spendable.erc20Amounts;

          return this.tokensBuilderService
            .getTokensList(blockchain, _query, direction, inputValue)
            .pipe(
              map(tokens => {
                return tokens
                  .filter(token => {
                    const isAvailable = availableTokensForBlockchains.some(availableToken =>
                      compareAddresses(availableToken.tokenAddress, token.address)
                    );
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
        } else {
          const availableTokens = Object.entries(event).flatMap(([blockchain, bucketRecord]) => {
            const record = bucketRecord;
            if (!record?.Spendable?.chain || !record?.Spendable?.erc20Amounts) {
              return [];
            }

            return record.Spendable.erc20Amounts.map((token: RubicAny) => ({
              tokenAddress: token.tokenAddress,
              amount: token.amount,
              blockchain
            }));
          });
          return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
            map(tokens => {
              return tokens
                .filter(token => {
                  const isAvailable = availableTokens.some(
                    availableToken =>
                      compareAddresses(availableToken.tokenAddress, token.address) &&
                      availableToken.blockchain === token.blockchain
                  );
                  return isAvailable;
                })
                .map(token => {
                  const balance = availableTokens.find(
                    availableToken =>
                      compareAddresses(availableToken.tokenAddress, token.address) &&
                      availableToken.blockchain === token.blockchain
                  )?.amount;

                  return {
                    ...token,
                    amount: Token.fromWei(balance.toString(), token.decimals) || token.amount
                  };
                });
            })
          );
        }
      })
    );
  }
}
