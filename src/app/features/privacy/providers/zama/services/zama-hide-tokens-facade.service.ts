import { map, Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';

import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { inject, Injectable } from '@angular/core';
import { ZamaTokensService } from './zama-sdk/zama-tokens.service';
import { BlockchainsInfo, compareAddresses, EvmBlockchainName } from '@cryptorubic/core';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { BalanceFetchingConfig } from '@app/core/services/tokens/models/tokens-balance-service-types';

@Injectable()
export class ZamaHideTokensFacadeService extends TokensFacadeService {
  private readonly tokensService = inject(ZamaTokensService);

  public override getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    _inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    const supportedTokensMapping = this.tokensService.supportedTokensMapping;

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
