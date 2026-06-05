import { Injectable } from '@angular/core';
import { AssetListType } from '@app/features/trade/models/asset';
import { SwapFormInput } from '@app/features/trade/models/swap-form-controls';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { Observable, map } from 'rxjs';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { getMinimalTokensByChain, getTokenKey } from './utils/get-minimal-tokens-by-chain';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { BlockchainsInfo } from '@cryptorubic/core';
import { BalanceFetchingConfig } from '@app/core/services/tokens/models/tokens-balance-service-types';

@Injectable()
export class PrivacycashPublicTokensFacadeService extends TokensFacadeService {
  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const pcSupportedTokensByChain: MinimalToken[] = getMinimalTokensByChain(type);
    const addrToTokenMap = pcSupportedTokensByChain.reduce(
      (acc, token) => ({ ...acc, [getTokenKey(token)]: token }),
      {} as Record<string, MinimalToken>
    );

    return this.tokensBuilderService
      .getTokensList(
        type,
        _query,
        direction,
        getEmptySwapFormInput(),
        this.defineBalanceFetchingConfig(type)
      )
      .pipe(
        map(tokens => {
          return tokens.filter(token => !!addrToTokenMap[getTokenKey(token)]);
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
