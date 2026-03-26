import { Injectable } from '@angular/core';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { Observable, map } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { getMinimalTokensByChain, getTokenKey } from './utils/get-minimal-tokens-by-chain';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';

@Injectable()
export class PrivacycashPublicTokensFacadeService extends TokensFacadeService {
  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const pcSupportedTokensByChain: MinimalToken[] = getMinimalTokensByChain(type);
    const addrToTokenMap = pcSupportedTokensByChain.reduce(
      (acc, token) => ({ ...acc, [getTokenKey(token)]: token }),
      {} as Record<string, MinimalToken>
    );

    return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue).pipe(
      map(tokens => {
        return tokens.filter(
          token =>
            PRIVATE_MODE_SUPPORTED_TOKENS[token.blockchain]?.includes(token.address) &&
            !!addrToTokenMap[getTokenKey(token)]
        );
      })
    );
  }
}
