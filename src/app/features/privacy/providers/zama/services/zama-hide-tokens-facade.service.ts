import { map, Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';

import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { inject, Injectable } from '@angular/core';
import { ZamaTokensService } from './zama-sdk/zama-tokens.service';
import { compareAddresses, EvmBlockchainName } from '@cryptorubic/core';

@Injectable()
export class ZamaHideTokensFacadeService extends TokensFacadeService {
  private readonly tokensService = inject(ZamaTokensService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const supportedTokensMapping = this.tokensService.supportedTokensMapping;

    return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
      map(tokens => {
        const supportedTokens = tokens.filter(({ blockchain, address }) => {
          const shieldedTokens = supportedTokensMapping[blockchain as EvmBlockchainName];
          return (
            shieldedTokens &&
            shieldedTokens.find(token => compareAddresses(token.tokenAddress, address))
          );
        });

        return supportedTokens;
      })
    );
  }
}
