import { Injectable } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { map, Observable } from 'rxjs';
import { BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';
import { BalanceFetchingConfig } from '@app/core/services/tokens/models/tokens-balance-service-types';

@Injectable()
export class HinkalHideFacadeService extends TokensFacadeService {
  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.tokensBuilderService
      .getTokensList(
        type,
        _query,
        direction,
        getEmptySwapFormInput(),
        this.defineBalanceFetchingConfig(type)
      )
      .pipe(
        map((tokens: AvailableTokenAmount[]) => {
          return tokens
            .filter(token =>
              HINKAL_SUPPORTED_CHAINS.includes(token.blockchain as EvmBlockchainName)
            )
            .filter(token =>
              PRIVATE_MODE_SUPPORTED_TOKENS[token.blockchain]?.includes(token.address)
            );
        })
      );
  }

  private defineBalanceFetchingConfig(assetType: AssetListType): BalanceFetchingConfig {
    if (BlockchainsInfo.isBlockchainName(assetType)) {
      const walletAddr = this.walletConnectorService.getActiveWalletAddress({
        blockchain: assetType
      });
      return { walletAddressesToFetch: walletAddr ? [walletAddr] : [] };
    }
    return { walletAddressesToFetch: [] };
  }
}
