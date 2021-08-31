import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { first } from 'rxjs/operators';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';
import { PanamaBridgeProviderService } from '../common/panama-bridge-provider/panama-bridge-provider.service';
import { PanamaToken } from '../common/panama-bridge-provider/models/PanamaToken';

@Injectable()
export class EthereumTronBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private readonly commonPanamaBridgeProviderService: PanamaBridgeProviderService) {
    super();

    this.commonPanamaBridgeProviderService.tokens.pipe(first()).subscribe(tokens => {
      this.tokenPairs$.next(
        tokens
          .filter(token => token.symbol === 'USDT')
          .map(EthereumTronBridgeProviderService.parseUSDTPanamaToken)
      );
    });
  }

  private static parseUSDTPanamaToken(token: PanamaToken): BridgeTokenPair {
    return {
      symbol: token.symbol,
      image: '',
      rank: 0,

      tokenByBlockchain: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          blockchain: BLOCKCHAIN_NAME.ETHEREUM,
          address: token.ethContractAddress,
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        },
        [BLOCKCHAIN_NAME.TRON]: {
          blockchain: BLOCKCHAIN_NAME.TRON,
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        }
      }
    };
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.PANAMA;
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    return this.commonPanamaBridgeProviderService.getFee(tokenPair, toBlockchain);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return this.commonPanamaBridgeProviderService.createTrade(bridgeTrade);
  }

  public needApprove(): Observable<boolean> {
    return this.commonPanamaBridgeProviderService.needApprove();
  }

  public approve(): Observable<TransactionReceipt> {
    return this.commonPanamaBridgeProviderService.approve();
  }
}
