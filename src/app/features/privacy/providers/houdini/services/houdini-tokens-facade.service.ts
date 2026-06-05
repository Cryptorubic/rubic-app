import { Injectable } from '@angular/core';
import { BalanceFetchingConfig } from '@app/core/services/tokens/models/tokens-balance-service-types';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HOUDINI_SUPPORTED_CHAINS } from '@app/features/privacy/providers/houdini/constants/chains';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { BlockchainsInfo } from '@cryptorubic/core';
import { Observable, map } from 'rxjs';

@Injectable()
export class HoudiniTokensFacadeService extends TokensFacadeService {
  public getTokensList(
    type: AssetListType,
    query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.tokensBuilderService
      .getTokensList(type, query, direction, inputValue, this.defineBalanceFetchingConfig(type))
      .pipe(
        map(tokens => {
          return tokens.filter(token =>
            HOUDINI_SUPPORTED_CHAINS.some(supportedChain => supportedChain === token.blockchain)
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
