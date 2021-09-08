import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { first } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import BigNumber from 'bignumber.js';
import { EthereumBinancePanamaBridgeProviderService } from './panama-bridge-provider/ethereum-binance-panama-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from './rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';

@Injectable()
export class EthereumBinanceBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(
    private readonly panamaBridgeProvider: EthereumBinancePanamaBridgeProviderService,
    private readonly rubicBridgeProvider: EthereumBinanceRubicBridgeProviderService
  ) {
    super();

    zip(this.rubicBridgeProvider.tokenPairs, this.panamaBridgeProvider.tokenPairs)
      .pipe(first())
      .subscribe(([rubicToken, panamaTokens]) =>
        this.tokenPairs$.next(rubicToken.concat(panamaTokens))
      );
  }

  public getProviderType(token?: BridgeTokenPair): BRIDGE_PROVIDER {
    return token?.symbol === 'RBC' ? BRIDGE_PROVIDER.SWAP_RBC : BRIDGE_PROVIDER.PANAMA;
  }

  /**
   * @description get estimate gas for trade
   * @return observable estimated gas of trade
   */
  public getEstimatedGas(): Observable<BigNumber> {
    return this.panamaBridgeProvider.getEstimatedGas();
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (tokenPair.symbol === 'RBC') {
      return this.rubicBridgeProvider.getFee(tokenPair, toBlockchain);
    }
    return this.panamaBridgeProvider.getFee(tokenPair, toBlockchain);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.createTrade(bridgeTrade);
    }
    return this.panamaBridgeProvider.createTrade(bridgeTrade);
  }

  approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.approve(bridgeTrade);
    }
    return this.panamaBridgeProvider.approve();
  }

  needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.needApprove(bridgeTrade);
    }
    return this.panamaBridgeProvider.needApprove();
  }
}
