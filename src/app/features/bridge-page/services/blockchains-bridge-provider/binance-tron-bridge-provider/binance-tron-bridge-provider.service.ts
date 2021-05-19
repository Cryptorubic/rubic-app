import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { List } from 'immutable';
import { map } from 'rxjs/operators';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';
import { PanamaBridgeProviderService } from '../common/panama-bridge-provider/panama-bridge-provider.service';
import { BlockchainsTokens, BridgeToken } from '../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from '../../../models/BridgeTrade';
import { PanamaToken } from '../common/panama-bridge-provider/models/PanamaToken';

@Injectable()
export class BinanceTronBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private commonPanamaBridgeProviderService: PanamaBridgeProviderService) {
    super();
  }

  private static parseUSDTPanamaToken(token: PanamaToken): BridgeToken {
    return {
      symbol: token.symbol,
      image: '',
      rank: 0,

      blockchainToken: {
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
          address: token.bscContractAddress,
          name: token.name,
          symbol: token.bscSymbol,
          decimals: token.bscContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        },
        [BLOCKCHAIN_NAME.TRON]: {
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        }
      } as BlockchainsTokens
    };
  }

  getTokensList(): Observable<List<BridgeToken>> {
    return this.commonPanamaBridgeProviderService.getTokensList().pipe(
      map(tokens => {
        return tokens
          .filter(token => token.symbol === 'USDT')
          .map(BinanceTronBridgeProviderService.parseUSDTPanamaToken);
      })
    );
  }

  getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    return this.commonPanamaBridgeProviderService.getFee(token, toBlockchain);
  }

  createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    return this.commonPanamaBridgeProviderService.createTrade(bridgeTrade, updateTransactionsList);
  }
}
