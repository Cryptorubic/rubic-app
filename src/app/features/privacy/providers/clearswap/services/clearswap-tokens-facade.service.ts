import { Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { CLEARSWAP_SUPPORTED_CHAINS } from '@app/features/privacy/providers/clearswap/constants/clearswap-chains';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { Observable, map } from 'rxjs';

@Injectable()
export class ClearswapTokensFacadeService extends TokensFacadeService {
  public getTokensList(
    type: AssetListType,
    query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.tokensBuilderService.getTokensList(type, query, direction, inputValue).pipe(
      map(tokens => {
        return tokens.filter(token =>
          CLEARSWAP_SUPPORTED_CHAINS.some(supportedChain => supportedChain === token.blockchain)
        );
      })
    );
  }
}
