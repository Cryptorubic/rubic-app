import { List } from 'immutable';
import { Observable, Subject } from 'rxjs';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { BridgeTrade } from '@features/bridge/models/bridge-trade';
import { BridgeProvider } from '@shared/models/bridge/bridge-provider';
import BigNumber from 'bignumber.js';

export abstract class BlockchainsBridgeProvider {
  protected _tokenPairs$ = new Subject<List<BridgeTokenPair>>();

  /**
   * list of tokens that can be used in a bridge
   */
  public get tokenPairs$(): Observable<List<BridgeTokenPair>> {
    return this._tokenPairs$.asObservable();
  }

  /**
   * get type of provider
   */
  public abstract getProviderType?(token?: BridgeTokenPair): BridgeProvider;

  /**
   * get price blockchain provider's fee
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
   * create trade between different networks
   * @param bridgeTrade object with data for trade
   * @return observable transaction receipt object
   */
  public abstract createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt>;

  /**
   * check if trade requires approve
   * @param bridgeTrade object with data for trade
   * @return trade requires approve or no
   */
  public abstract needApprove(bridgeTrade: BridgeTrade): Observable<boolean>;

  /**
   * approve tokens for trade
   * @param bridgeTrade object with data for trade
   * @return observable transaction receipt object
   */
  public abstract approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt>;
}
