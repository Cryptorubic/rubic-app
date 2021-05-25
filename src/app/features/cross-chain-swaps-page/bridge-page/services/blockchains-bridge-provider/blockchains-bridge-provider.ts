import { List } from 'immutable';
import { Observable } from 'rxjs';
import { BridgeTrade } from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeTrade';
import { BridgeToken } from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeToken';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export abstract class BlockchainsBridgeProvider {
  public abstract getTokensList(swapTokens: List<SwapToken>): Observable<List<BridgeToken>>;

  public abstract getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number>;

  public abstract createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string>;
}
