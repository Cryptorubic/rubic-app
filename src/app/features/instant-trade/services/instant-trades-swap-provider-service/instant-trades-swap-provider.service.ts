import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { SupportedTokensInfo } from '../../../swaps/models/SupportedTokensInfo';
import { SwapProvider } from '../../../swaps/services/swap-provider';
import { SWAP_PROVIDER_TYPE } from '../../../swaps/models/SwapProviderType';

@Injectable()
export class InstantTradesSwapProviderService extends SwapProvider {
  get tokens(): Observable<SupportedTokensInfo> {
    const supportedTokensInfo = this.getSupportedTokensInfoTemplate();

    return this.tokensService.tokens.pipe(
      filter(tokens => !!tokens.size),
      map(tokensList => {
        const tokens = tokensList.toArray();
        const supportedBlockchains = [
          BLOCKCHAIN_NAME.ETHEREUM,
          BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
          BLOCKCHAIN_NAME.POLYGON,
          BLOCKCHAIN_NAME.TRON,
          BLOCKCHAIN_NAME.XDAI,
          BLOCKCHAIN_NAME.HARMONY
        ];

        supportedBlockchains.forEach(
          blockchain =>
            (supportedTokensInfo[blockchain][blockchain] = tokens.filter(
              token => token.blockchain === blockchain
            ))
        );
        return supportedTokensInfo;
      })
    );
  }

  constructor(private tokensService: TokensService) {
    super();
    this.TYPE = SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }
}
