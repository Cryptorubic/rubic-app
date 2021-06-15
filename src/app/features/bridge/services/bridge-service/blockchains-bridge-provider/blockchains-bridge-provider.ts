import { List } from 'immutable';
import { Observable, Subject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { BRIDGE_PROVIDER_TYPE } from 'src/app/features/bridge/models/ProviderType';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';

export abstract class BlockchainsBridgeProvider {
  protected tokens$ = new Subject<List<BridgeToken>>();

  /**
   * @description list of tokens that can be used in a bridge
   */
  public get tokens(): Observable<List<BridgeToken>> {
    return this.tokens$.asObservable();
  }

  /**
   * @description get type of provider
   */
  public abstract getProviderType?(token?: BridgeToken): BRIDGE_PROVIDER_TYPE;

  /**
   * @description get price blockchain provider's fee
   * @param token bridge token
   * @param toBlockchain destination blockchain
   * @return observable number fee price
   */
  public abstract getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number>;

  /**
   * @description create trade between different networks
   * @param bridgeTrade object with data for trade
   * @param updateTransactionsList callback function for update list of bridge trades
   * @return observable transaction receipt object
   */
  public abstract createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<TransactionReceipt>;
}
