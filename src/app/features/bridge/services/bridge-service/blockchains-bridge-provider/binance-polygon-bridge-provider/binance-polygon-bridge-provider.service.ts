import { Injectable } from '@angular/core';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { first } from 'rxjs/operators';
import { BridgeTokenPair } from '@features/bridge/models/BridgeTokenPair';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/BRIDGE_PROVIDER';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { Observable } from 'rxjs';
import { BridgeTrade } from '@features/bridge/models/BridgeTrade';
import { TransactionReceipt } from 'web3-eth';
import { UnknownError } from '@core/errors/models/unknown.error';
import { BinancePolygonRubicBridgeProviderService } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-rubic-bridge-provider/binance-polygon-rubic-bridge-provider.service';

@Injectable()
export class BinancePolygonBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(private readonly rubicBridgeProvider: BinancePolygonRubicBridgeProviderService) {
    super();
    this.rubicBridgeProvider.tokenPairs$
      .pipe(first())
      .subscribe(rubicToken => this._tokenPairs$.next(rubicToken));
  }

  public getProviderType(token?: BridgeTokenPair): BRIDGE_PROVIDER {
    if (this.isRBCToken(token?.symbol)) {
      return BRIDGE_PROVIDER.SWAP_RBC;
    }
    throw new UnknownError();
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (this.isRBCToken(tokenPair.symbol)) {
      return this.rubicBridgeProvider.getFee(tokenPair, toBlockchain);
    }
    throw new UnknownError();
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    if (this.isRBCToken(bridgeTrade.token.symbol)) {
      return this.rubicBridgeProvider.createTrade(bridgeTrade);
    }
    throw new UnknownError();
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    if (this.isRBCToken(bridgeTrade.token.symbol)) {
      return this.rubicBridgeProvider.approve(bridgeTrade);
    }
    throw new UnknownError();
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    if (this.isRBCToken(bridgeTrade.token.symbol)) {
      return this.rubicBridgeProvider.needApprove(bridgeTrade);
    }
    throw new UnknownError();
  }

  private isRBCToken(symbol: string): boolean {
    return symbol === 'RBC';
  }
}
