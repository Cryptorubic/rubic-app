import { List } from 'immutable';
import { Observable } from 'rxjs';
import { BridgeToken } from '../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { BridgeTrade } from '../../models/BridgeTrade';

export abstract class BlockchainBridgeProvider {
  public abstract getTokensList(swapTokens: List<SwapToken>): Observable<List<BridgeToken>>;

  public abstract getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number>;

  public abstract createTrade(bridgeTrade: BridgeTrade): Observable<string>;
}
