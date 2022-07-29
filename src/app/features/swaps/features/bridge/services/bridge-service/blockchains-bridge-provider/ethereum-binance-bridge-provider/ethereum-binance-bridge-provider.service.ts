import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';
import { BridgeTrade } from '@features/swaps/features/bridge/models/bridge-trade';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { UnknownError } from '@core/errors/models/unknown.error';
import { EthereumBinanceRubicBridgeProviderService } from 'src/app/features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { BlockchainsBridgeProvider } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { RubicBridgeSupportedBlockchains } from '../common/rubic-bridge/models/types';

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

  public getFee(
    fromBlockchain: RubicBridgeSupportedBlockchains,
    toBlockchain: RubicBridgeSupportedBlockchains,
    tokenPair: BridgeTokenPair
  ): Observable<number> {
    if (tokenPair.symbol === 'RBC') {
      return this.rubicBridgeProvider.getFee(fromBlockchain, toBlockchain);
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
