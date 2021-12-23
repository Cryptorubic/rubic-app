import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { UnknownError } from '@core/errors/models/unknown.error';
import { EthereumBinanceRubicBridgeProviderService } from './rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';

@Injectable()
export class EthereumBinanceBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private readonly rubicBridgeProvider: EthereumBinanceRubicBridgeProviderService) {
    super();
    this.rubicBridgeProvider.tokenPairs$
      .pipe(first())
      .subscribe(rubicToken => this._tokenPairs$.next(rubicToken));
  }

  public getProviderType(token?: BridgeTokenPair): BRIDGE_PROVIDER {
    if (token?.symbol === 'RBC') {
      return BRIDGE_PROVIDER.SWAP_RBC;
    }
    throw new UnknownError();
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (tokenPair.symbol === 'RBC') {
      return this.rubicBridgeProvider.getFee(tokenPair, toBlockchain);
    }
    throw new UnknownError();
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.createTrade(bridgeTrade);
    }
    throw new UnknownError();
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.approve(bridgeTrade);
    }
    throw new UnknownError();
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.needApprove(bridgeTrade);
    }
    throw new UnknownError();
  }
}
