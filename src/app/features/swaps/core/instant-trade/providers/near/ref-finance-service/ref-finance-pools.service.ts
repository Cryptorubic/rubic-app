import { Injectable } from '@angular/core';
import { RefPool } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/ref-pool';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  REF_FI_CONTRACT_ID,
  WRAP_NEAR_CONTRACT
} from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/constants/ref-fi-constants';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { providers, WalletConnection } from 'near-api-js';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import BigNumber from 'bignumber.js';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PoolRPCView } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/pool-rpc-view';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

interface PoolsQuery {
  result: object;
  block_height: number;
  block_hash: string;
}

@Injectable({
  providedIn: SwapsCoreModule
})
export class RefFinancePoolsService {
  /**
   *  Wallet connection account.
   */
  private account: WalletConnection;

  /**
   * Default page limit for pools pagination.
   */
  private readonly defaultPageLimit: number = 100;

  /**
   * Near JSON RPC provider.
   */
  private provider: JsonRpcProvider;

  constructor(private readonly walletConnectorService: WalletConnectorService) {
    this.provider = new providers.JsonRpcProvider(NEAR_MAINNET_CONFIG.nodeUrl);
    this.walletConnectorService.addressChange$.subscribe(() => {
      if (this.walletConnectorService.networkName === BLOCKCHAIN_NAME.NEAR) {
        this.account = new WalletConnection(this.walletConnectorService.nearConnection, 'rubic');
      } else {
        this.account = null;
      }
    });
  }

  /**
   * Gets pools for specific tokens addresses.
   * @param fromToken From token.
   * @param amountIn Amount of tokens to trade.
   * @param toToken To token.
   */
  public async getPoolsByTokens(
    fromToken: InstantTradeToken,
    amountIn: BigNumber,
    toToken: InstantTradeToken
  ): Promise<RefPool[]> {
    const fromAmount = Web3Pure.toWei(amountIn, fromToken.decimals);
    const totalPools = await this.getTotalPools();
    const pages = Math.ceil(totalPools / this.defaultPageLimit);
    const pools = (
      await Promise.all([...Array(pages)].map((_, i) => this.getAllPools(i + 1)))
    ).flat();

    const fromTokenAddress =
      fromToken.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : fromToken.address;
    const toTokenAddress =
      toToken.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : toToken.address;

    return pools.filter(
      p => new BigNumber(p.supplies[fromTokenAddress]).gte(fromAmount) && p.supplies[toTokenAddress]
    );
  }

  /**
   * Gets all available tokens pools.
   * @param page Page number for pagination.
   * @param perPage Amount of pools per page.
   */
  private async getAllPools(
    page: number = 1,
    perPage: number = this.defaultPageLimit
  ): Promise<RefPool[]> {
    const index = (page - 1) * perPage;
    const args = { from_index: index, limit: perPage };
    const rawResult = await this.provider.query<PoolsQuery>({
      request_type: 'call_function',
      account_id: REF_FI_CONTRACT_ID,
      method_name: 'get_pools',
      finality: 'optimistic',
      args_base64: btoa(JSON.stringify(args))
    });
    const poolData: PoolRPCView[] = JSON.parse(Buffer.from(rawResult.result).toString());
    return poolData.map((rawPool, i) => this.parsePool(rawPool, i + index));
  }

  /**
   * Gets amount of available tokens pools.
   */
  private async getTotalPools(): Promise<number> {
    const rawResult = await this.provider.query<PoolsQuery>({
      request_type: 'call_function',
      account_id: REF_FI_CONTRACT_ID,
      method_name: 'get_number_of_pools',
      finality: 'optimistic',
      args_base64: ''
    });
    return JSON.parse(Buffer.from(rawResult.result).toString());
  }

  /**
   * Parse RPC view pool and transforms to {@link RefPool} object.
   * @param pool RPC view pool.
   * @param id Pool identifier.
   */
  private parsePool(pool: PoolRPCView, id?: number): RefPool {
    return {
      id: id >= 0 ? id : pool.id,
      tokenIds: pool.token_account_ids,
      supplies: pool.amounts.reduce(
        (acc: { [tokenId: string]: string }, amount: string, i: number) => {
          acc[pool.token_account_ids[i]] = amount;
          return acc;
        },
        {}
      ),
      fee: pool.total_fee,
      shareSupply: pool.shares_total_supply,
      tvl: pool.tvl,
      token0_ref_price: pool.token0_ref_price
    };
  }
}
