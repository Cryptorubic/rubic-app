import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlockchainsBridgeProvider } from '../../blockchains-bridge-provider';
import { BlockchainsTokens, BridgeToken } from '../../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from '../../../../models/BridgeTrade';
import { PanamaBridgeProviderService } from '../../common/panama-bridge-provider/panama-bridge-provider.service';
import { NATIVE_TOKEN_ADDRESS } from '../../../../../../shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { PanamaToken } from '../../common/panama-bridge-provider/models/PanamaToken';

@Injectable()
export class EthereumBinancePanamaBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private panamaBridgeProvider: PanamaBridgeProviderService) {
    super();
  }

  private static parsePanamaToken(token: PanamaToken): BridgeToken {
    return {
      symbol: token.symbol,
      image: '',
      rank: 0,

      blockchainToken: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          address: token.ethContractAddress || (token.ethSymbol === 'ETH' && NATIVE_TOKEN_ADDRESS),
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
          address: token.bscContractAddress,
          name: token.name,
          symbol: token.bscSymbol,
          decimals: token.bscContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        }
      } as BlockchainsTokens,

      fromEthFee: token.ethToBscFee,
      toEthFee: token.bscToEthFee
    };
  }

  public getTokensList(): Observable<List<BridgeToken>> {
    return this.panamaBridgeProvider
      .getTokensList()
      .pipe(map(tokens => tokens.map(EthereumBinancePanamaBridgeProviderService.parsePanamaToken)));
  }

  public getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    return this.panamaBridgeProvider.getFee(token, toBlockchain);
  }

  public createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    return this.panamaBridgeProvider.createTrade(bridgeTrade, updateTransactionsList);
  }
}
