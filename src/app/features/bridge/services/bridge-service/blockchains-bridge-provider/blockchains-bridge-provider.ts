import { List } from 'immutable';
import { Observable, Subject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import BigNumber from 'bignumber.js';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';
import { inject } from '@angular/core';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';

export abstract class BlockchainsBridgeProvider {
  protected tokenPairs$ = new Subject<List<BridgeTokenPair>>();

  protected blockchainPublicService = inject(BlockchainPublicService);

  /**
   * list of tokens that can be used in a bridge
   */
  public get tokenPairs(): Observable<List<BridgeTokenPair>> {
    return this.tokenPairs$.asObservable();
  }

  /**
   * get type of provider
   */
  public abstract getProviderType?(token?: BridgeTokenPair): BRIDGE_PROVIDER;

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

  public getEthereumBlockchainProvider(blockchain: BLOCKCHAIN_NAME): Web3Public | null {
    const adapter = this.blockchainPublicService.adapters[blockchain];
    if (adapter instanceof Web3Public) {
      return adapter;
    }
    return null;
  }
}
