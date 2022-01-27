import { Injectable } from '@angular/core';
import {
  PoolRPCView,
  RefPool
} from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-pool';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  REF_FI_CONTRACT_ID,
  WRAP_NEAR_CONTRACT
} from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { providers, WalletConnection } from 'near-api-js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import BigNumber from 'bignumber.js';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

@Injectable({
  providedIn: 'root'
})
export class RefFinancePoolsService {
  private account: WalletConnection;

  private readonly defaultPageLimit: number = 100;

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

  private async getAllPools(
    page: number = 1,
    perPage: number = this.defaultPageLimit
  ): Promise<RefPool[]> {
    const index = (page - 1) * perPage;
    const args = { from_index: index, limit: perPage };
    const rawResult = (await this.provider.query({
      request_type: 'call_function',
      account_id: REF_FI_CONTRACT_ID,
      method_name: 'get_pools',
      finality: 'optimistic',
      args_base64: btoa(JSON.stringify(args))
    })) as unknown as { result: unknown };
    const poolData = JSON.parse(Buffer.from(rawResult.result).toString()) as PoolRPCView[];
    return poolData.map((rawPool, i) => this.parsePool(rawPool, i + index));
  }

  private async getTotalPools(): Promise<number> {
    const rawResult = (await this.provider.query({
      request_type: 'call_function',
      account_id: REF_FI_CONTRACT_ID,
      method_name: 'get_number_of_pools',
      finality: 'optimistic',
      args_base64: ''
    })) as unknown as { result: unknown };
    return JSON.parse(Buffer.from(rawResult.result).toString());
  }

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
