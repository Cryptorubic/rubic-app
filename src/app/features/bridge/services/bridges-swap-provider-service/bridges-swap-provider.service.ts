import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import BigNumber from 'bignumber.js';
import { SWAP_PROVIDER_TYPE } from '../../../swaps/models/SwapProviderType';
import { SwapProvider } from '../../../swaps/services/swap-provider';
import { SupportedTokensInfo } from '../../../swaps/models/SupportedTokensInfo';
import { BridgeService } from '../bridge-service/bridge.service';

@Injectable()
export class BridgesSwapProviderService extends SwapProvider {
  get tokens(): Observable<SupportedTokensInfo> {
    function addToken(
      tokenAmounts: List<TokenAmount>,
      tokens: TokenAmount[],
      bridgeToken: BridgeToken,
      blockchain: BLOCKCHAIN_NAME
    ) {
      const foundTokenAmount = tokenAmounts.find(
        tokenAmount =>
          tokenAmount.blockchain === blockchain &&
          tokenAmount.address.toLowerCase() ===
            bridgeToken.blockchainToken[blockchain].address.toLowerCase()
      );
      tokens.push({
        ...foundTokenAmount,
        ...bridgeToken.blockchainToken[blockchain],
        blockchain,
        amount: foundTokenAmount?.amount || new BigNumber(0)
      });
    }

    return this.bridgeService.tokens.pipe(
      withLatestFrom(this.tokensService.tokens),
      map(([blockchainsBridgeTokensArray, tokenAmounts]) => {
        const supportedTokensInfo = this.getSupportedTokensInfoTemplate();

        blockchainsBridgeTokensArray.forEach(blockchainsBridgeTokens => {
          const { fromBlockchain, toBlockchain } = blockchainsBridgeTokens;
          const fromTokens: TokenAmount[] = [];
          const toTokens: TokenAmount[] = [];

          blockchainsBridgeTokens.bridgeTokens.forEach(bridgeToken => {
            addToken(tokenAmounts, fromTokens, bridgeToken, fromBlockchain);
            addToken(tokenAmounts, toTokens, bridgeToken, toBlockchain);
          });

          supportedTokensInfo[fromBlockchain][toBlockchain] = toTokens;
          supportedTokensInfo[toBlockchain][fromBlockchain] = fromTokens;
        });

        return supportedTokensInfo;
      })
    );
  }

  get bridgeTokensPairs(): Observable<BlockchainsBridgeTokens[]> {
    return this.bridgeService.tokens;
  }

  constructor(
    private readonly bridgeService: BridgeService,
    private readonly tokensService: TokensService
  ) {
    super();
    this.TYPE = SWAP_PROVIDER_TYPE.BRIDGE;
  }
}
