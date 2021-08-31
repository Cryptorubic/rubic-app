import { List } from 'immutable';
import { Observable, Subject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import BigNumber from 'bignumber.js';

export abstract class BlockchainsBridgeProvider {
  protected tokenPairs$ = new Subject<List<BridgeTokenPair>>();

  /**
   * @description list of tokens that can be used in a bridge
   */
  public get tokenPairs(): Observable<List<BridgeTokenPair>> {
    return this.tokenPairs$.asObservable();
  }

  /**
   * @description get type of provider
   */
  public abstract getProviderType?(token?: BridgeTokenPair): BRIDGE_PROVIDER;

  /**
   * @description get price blockchain provider's fee
   * @param tokenPair bridge token pair
   * @param toBlockchain destination blockchain
   * @param amount swap input amount
   * @return observable number fee price
   */
  public abstract getFee(
    tokenPair: BridgeTokenPair,
    toBlockchain: BLOCKCHAIN_NAME,
    amount?: BigNumber
  ): Observable<number>;

  /**
   * @description create trade between different networks
   * @param bridgeTrade object with data for trade
   * @return observable transaction receipt object
   */
  public abstract createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt>;

  /**
   * @description check if trade requires approve
   * @param bridgeTrade object with data for trade
   * @return trade requires approve or no
   */
  public abstract needApprove(bridgeTrade: BridgeTrade): Observable<boolean>;

  /**
   * @description approve tokens for trade
   * @param bridgeTrade object with data for trade
   * @return observable transaction receipt object
   */
  public abstract approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt>;
}
