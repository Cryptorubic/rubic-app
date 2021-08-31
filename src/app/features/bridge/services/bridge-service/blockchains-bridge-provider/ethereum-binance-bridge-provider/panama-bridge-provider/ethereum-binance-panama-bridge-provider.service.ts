import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { first } from 'rxjs/operators';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { PanamaToken } from '../../common/panama-bridge-provider/models/PanamaToken';
import { PanamaBridgeProviderService } from '../../common/panama-bridge-provider/panama-bridge-provider.service';
import { BlockchainsBridgeProvider } from '../../blockchains-bridge-provider';

@Injectable()
export class EthereumBinancePanamaBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private readonly panamaBridgeProvider: PanamaBridgeProviderService) {
    super();

    this.panamaBridgeProvider.tokens
      .pipe(first())
      .subscribe(tokens =>
        this.tokenPairs$.next(
          tokens.map(EthereumBinancePanamaBridgeProviderService.parsePanamaToken)
        )
      );
  }

  private static parsePanamaToken(token: PanamaToken): BridgeTokenPair {
    return {
      symbol: token.symbol,
      image: '',
      rank: 0,

      tokenByBlockchain: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          blockchain: BLOCKCHAIN_NAME.ETHEREUM,
          address: token.ethContractAddress || (token.ethSymbol === 'ETH' && NATIVE_TOKEN_ADDRESS),
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
          blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
          address: token.bscContractAddress,
          name: token.name,
          symbol: token.bscSymbol,
          decimals: token.bscContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        }
      },

      fromEthFee: token.ethToBscFee,
      toEthFee: token.bscToEthFee
    };
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.PANAMA;
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    return this.panamaBridgeProvider.getFee(tokenPair, toBlockchain);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return this.panamaBridgeProvider.createTrade(bridgeTrade);
  }

  public needApprove(): Observable<boolean> {
    return this.panamaBridgeProvider.needApprove();
  }

  public approve(): Observable<TransactionReceipt> {
    return this.panamaBridgeProvider.approve();
  }
}
