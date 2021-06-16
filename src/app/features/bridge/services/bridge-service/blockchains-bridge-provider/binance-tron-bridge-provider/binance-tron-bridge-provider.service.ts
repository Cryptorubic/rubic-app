import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BRIDGE_PROVIDER_TYPE } from 'src/app/features/bridge/models/ProviderType';
import { BlockchainsTokens, BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { first } from 'rxjs/operators';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';
import { PanamaBridgeProviderService } from '../common/panama-bridge-provider/panama-bridge-provider.service';
import { PanamaToken } from '../common/panama-bridge-provider/models/PanamaToken';

@Injectable()
export class BinanceTronBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private readonly commonPanamaBridgeProviderService: PanamaBridgeProviderService) {
    super();

    this.commonPanamaBridgeProviderService.tokens
      .pipe(first())
      .subscribe(tokens =>
        this.tokens$.next(
          tokens
            .filter(token => token.symbol === 'USDT')
            .map(BinanceTronBridgeProviderService.parseUSDTPanamaToken)
        )
      );
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

  public getProviderType(): BRIDGE_PROVIDER_TYPE {
    return this.commonPanamaBridgeProviderService.getProviderType();
  }

  public getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    return this.commonPanamaBridgeProviderService.getFee(token, toBlockchain);
  }

  public createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<TransactionReceipt> {
    return this.commonPanamaBridgeProviderService.createTrade(bridgeTrade, updateTransactionsList);
  }
}
