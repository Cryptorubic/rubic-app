import { Injectable } from '@angular/core';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { Observable, map } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { getMinimalTokensByChain } from './utils/get-minimal-tokens-by-chain';

@Injectable()
export class PrivacycashPublicTokensFacadeService extends TokensFacadeService {
  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const getKey = (token: MinimalToken): string => {
      return `${token.blockchain}::${token.address.toLowerCase()}`;
    };
    const pcSupportedTokensByChain: MinimalToken[] = getMinimalTokensByChain(type);
    const addrToTokenMap = pcSupportedTokensByChain.reduce(
      (acc, token) => ({ ...acc, [getKey(token)]: token }),
      {} as Record<string, MinimalToken>
    );

    return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
      map(tokens => {
        return tokens.filter(token => !!addrToTokenMap[getKey(token)]);
      })
    );
  }
}
