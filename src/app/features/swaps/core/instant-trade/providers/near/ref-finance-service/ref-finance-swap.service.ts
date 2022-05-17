import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import {
  DEFAULT_DEPOSIT_AMOUNT,
  DEFAULT_NEAR_DEPOSIT_GAS,
  DEFAULT_TOKEN_DEPOSIT_GAS,
  DEFAULT_TRANSFER_CALL_GAS,
  NEW_ACCOUNT_STORAGE_COST,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  WRAP_NEAR_CONTRACT
} from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/constants/ref-fi-constants';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  RefPool,
  RefStablePool
} from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/ref-pool';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';
import { NearTransaction } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/near-transaction';
import { RefFinanceRoute } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/ref-finance-route';
import { WalletConnection } from 'near-api-js';
import { RefFiFunctionCallOptions } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/ref-function-calls';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { RefFinanceStableService } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/ref-finance-stable.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class RefFinanceSwapService {
  /**
   * Tokens fee divisor.
   */
  public static readonly feeDivisor = 10000;

  /**
   * Can tokens be wrapped/unwrapped or not.
   * @param fromAddress From token address.
   * @param toAddress To token address.
   */
  public static isWrap(fromAddress: string, toAddress: string): boolean {
    return (
      (fromAddress.toLowerCase() === NATIVE_NEAR_ADDRESS &&
        toAddress.toLowerCase() === WRAP_NEAR_CONTRACT) ||
      (fromAddress.toLowerCase() === WRAP_NEAR_CONTRACT && toAddress === NATIVE_NEAR_ADDRESS)
    );
  }

  /**
   * Gets specific instant trade object for tokens wrapping.
   * @param fromToken From token to wrap.
   * @param toToken Wrapped version of tokens.
   * @param amount Amount of tokens for wrap.
   */
  static getWrapTrade(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    amount: BigNumber
  ): InstantTrade {
    return {
      blockchain: BLOCKCHAIN_NAME.NEAR,
      from: {
        token: fromToken,
        amount: amount
      },
      to: {
        token: toToken,
        amount: amount
      },
      path: [
        { symbol: fromToken.symbol, address: fromToken.address },
        { symbol: toToken.symbol, address: toToken.address }
      ]
    };
  }

  /**
   * Gets specific instant trade object for direct tokens swap.
   * @param fromToken From token to swap.
   * @param toToken To token to swap.
   * @param fromAmount From amount of tokens to swap.
   * @param toAmount To amount of tokens to swap.
   */
  static getDirectTrade(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    fromAmount: BigNumber,
    toAmount: string
  ): InstantTrade {
    return {
      blockchain: BLOCKCHAIN_NAME.NEAR,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: new BigNumber(toAmount)
      },
      path: [
        { symbol: fromToken.symbol, address: fromToken.address },
        { symbol: toToken.symbol, address: toToken.address }
      ]
    };
  }

  /**
   * Gets specific instant trade object for transit tokens swap.
   * @param fromToken From token to swap.
   * @param transitToken Transit token to swap.
   * @param toToken To token to swap.
   * @param fromAmount From amount of tokens to swap.
   * @param toAmount To amount of tokens to swap.
   */
  public static getTransitTrade(
    fromToken: InstantTradeToken,
    transitToken: InstantTradeToken,
    toToken: InstantTradeToken,
    fromAmount: BigNumber,
    toAmount: string
  ): InstantTrade {
    return {
      blockchain: BLOCKCHAIN_NAME.NEAR,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: new BigNumber(toAmount)
      },
      path: [
        { symbol: fromToken.symbol, address: fromToken.address },
        { symbol: transitToken.symbol, address: transitToken.address },
        { symbol: toToken.symbol, address: toToken.address }
      ]
    };
  }

  constructor(
    private readonly nearPrivateAdapter: NearWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  /**
   * Handles wrap transaction.
   * @param trade Trade params to interact with.
   */
  public async handleWrap(trade: InstantTrade): Promise<void> {
    if (RefFinanceSwapService.isWrap(trade.from.token.address, trade.to.token.address)) {
      if (trade.from.token.address === NATIVE_NEAR_ADDRESS) {
        await this.wrapNear(trade.from.amount);
      } else {
        await this.unwrapNear(trade.from.amount);
      }
    }
  }

  /**
   * Wraps NEAR tokens to wNEAR.
   * @param amount Amount of tokens to wrap.
   */
  public async wrapNear(amount: BigNumber): Promise<void> {
    const account = new WalletConnection(
      this.walletConnectorService.nearConnection,
      'rubic'
    ).account();
    const wNearBalance = await account.viewFunction(WRAP_NEAR_CONTRACT, 'storage_balance_of', {
      account_id: account.accountId
    });

    const finalAmount = wNearBalance?.total > 0 ? amount : amount.plus(NEW_ACCOUNT_STORAGE_COST);
    const stringAmount = finalAmount.toString();

    const transactions: NearTransaction[] = [
      {
        receiverId: WRAP_NEAR_CONTRACT,
        functionCalls: [
          {
            methodName: 'near_deposit',
            args: {},
            gas: DEFAULT_NEAR_DEPOSIT_GAS,
            amount: stringAmount
          }
        ]
      }
    ];

    await this.nearPrivateAdapter.executeMultipleTransactions(transactions, 'wrap', stringAmount);
  }

  /**
   * Unwraps wNEAR tokens to NEAR.
   * @param amount Amount of tokens to unwrap.
   */
  private async unwrapNear(amount: BigNumber): Promise<void> {
    const weiAmount = Web3Pure.toWei(amount, 24);
    const transactions: NearTransaction[] = [
      {
        receiverId: WRAP_NEAR_CONTRACT,
        functionCalls: [
          {
            methodName: 'near_withdraw',
            args: { amount: weiAmount },
            amount: ONE_YOCTO_NEAR
          }
        ]
      }
    ];

    await this.nearPrivateAdapter.executeMultipleTransactions(transactions, 'wrap', weiAmount);
  }

  /**
   * Gets specific routes for defined tokens.
   * @param pools All tokens pools.
   * @param fromAmount Amount of tokens to trade.
   * @param fromToken From token to trade.
   * @param toToken To token to Trade.
   */
  public async getRoutes(
    pools: RefPool[],
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<RefFinanceRoute> {
    const routes = await this.getAllRoutes(pools, fromAmount, fromToken, toToken);
    const { estimate: toAmount, pool } = routes.sort((a, b) =>
      new BigNumber(b.estimate).gt(a.estimate) ? 1 : -1
    )[0];

    return { estimate: toAmount, pool };
  }

  /**
   * Gets all ref finance routes.
   * @param pools Available pools.
   * @param fromAmount Tokens from amount.
   * @param fromToken From token.
   * @param toToken To token.
   * @return Promise<RefFinanceRoute[]> Array of routes.
   */
  private async getAllRoutes(
    pools: RefPool[],
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<RefFinanceRoute[]> {
    const fromTokenAddress =
      fromToken.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : fromToken.address;
    const toTokenAddress =
      toToken.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : toToken.address;

    return Promise.all(
      pools.map(async pool => {
        // Stable pool.
        if (pool.tokenIds.length > 2) {
          const poolInfo = await this.getStablePool(pool.id);

          const swappedAmount = RefFinanceStableService.getSwappedAmount(
            fromToken.address,
            toToken.address,
            fromAmount,
            poolInfo
          );

          return {
            estimate: Web3Pure.fromWei(
              new BigNumber(swappedAmount),
              RefFinanceStableService.stableLpTokenDecimals
            ).toFixed(),
            pool
          };
        }
        const amountWithFee = fromAmount.multipliedBy(RefFinanceSwapService.feeDivisor - pool.fee);
        const inBalance = Web3Pure.fromWei(pool.supplies[fromTokenAddress], fromToken.decimals);
        const outBalance = Web3Pure.fromWei(pool.supplies[toTokenAddress], toToken.decimals);
        const estimate = amountWithFee
          .multipliedBy(outBalance)
          .dividedBy(
            new BigNumber(inBalance)
              .multipliedBy(RefFinanceSwapService.feeDivisor)
              .plus(amountWithFee)
          )
          .toString();
        return { estimate, pool };
      })
    );
  }

  /**
   * Creates transactions to register tokens on swap contract.
   * @param toTokenAddress To token address.
   * @param fromAddress From token address.
   * @param routes Trade routes.
   * @param swapType Swap type: CCR or IT.
   */
  public async createRegisterTokensTransactions(
    toTokenAddress: string,
    fromAddress: string,
    routes: [RefFinanceRoute] | [RefFinanceRoute, RefFinanceRoute],
    swapType: SWAP_PROVIDER_TYPE
  ): Promise<NearTransaction[]> {
    const transactions: NearTransaction[] = [];
    const account = new WalletConnection(
      this.walletConnectorService.nearConnection,
      'rubic'
    ).account();
    if (!routes) {
      return transactions;
    }
    if (routes.length > 1) {
      const transitTokenOutRegistered = await account.viewFunction(
        WRAP_NEAR_CONTRACT,
        'storage_balance_of',
        {
          account_id: account.accountId
        }
      );
      if (!transitTokenOutRegistered || transitTokenOutRegistered.total === '0') {
        const tokenOutActions: RefFiFunctionCallOptions[] = [
          {
            methodName: 'storage_deposit',
            args: {
              registration_only: true,
              account_id: account.accountId
            },
            gas: DEFAULT_TOKEN_DEPOSIT_GAS,
            amount: DEFAULT_DEPOSIT_AMOUNT
          }
        ];

        transactions.push({
          receiverId: WRAP_NEAR_CONTRACT,
          functionCalls: tokenOutActions
        });
      }
    }

    if (fromAddress === WRAP_NEAR_CONTRACT) {
      const tokenInRegistered = await account.viewFunction(
        WRAP_NEAR_CONTRACT,
        'storage_balance_of',
        {
          account_id: account.accountId
        }
      );

      if (!tokenInRegistered || tokenInRegistered.total === '0') {
        const tokenInActions: RefFiFunctionCallOptions[] = [
          {
            methodName: 'storage_deposit',
            args: {
              registration_only: true,
              account_id: account.accountId
            },
            gas: DEFAULT_TOKEN_DEPOSIT_GAS,
            amount: DEFAULT_DEPOSIT_AMOUNT
          }
        ];

        transactions.push({
          receiverId: WRAP_NEAR_CONTRACT,
          functionCalls: tokenInActions
        });
      }
    }

    if (swapType === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
      const tokenOutRegistered = await account.viewFunction(toTokenAddress, 'storage_balance_of', {
        account_id: account.accountId
      });

      if (!tokenOutRegistered || tokenOutRegistered.total === '0') {
        const tokenOutActions: RefFiFunctionCallOptions[] = [
          {
            methodName: 'storage_deposit',
            args: {
              registration_only: true,
              account_id: account.accountId
            },
            gas: DEFAULT_TOKEN_DEPOSIT_GAS,
            amount: DEFAULT_DEPOSIT_AMOUNT
          }
        ];

        transactions.push({
          receiverId: toTokenAddress,
          functionCalls: tokenOutActions
        });
      }
    }

    return transactions;
  }

  /**
   * Creates swap transaction.
   * @param fromAmountIn From amount to swap.
   * @param fromTokenAddress From token address.
   * @param toTokenAddress To token address.
   * @param minAmountOut Minimal amount out to get after swap.
   * @param routes Swap routes.
   */
  public async createSwapTransaction(
    fromAmountIn: string,
    fromTokenAddress: string,
    toTokenAddress: string,
    minAmountOut: string,
    routes: [RefFinanceRoute] | [RefFinanceRoute, RefFinanceRoute]
  ): Promise<NearTransaction> {
    const transitTokenAddress = WRAP_NEAR_CONTRACT;

    const actions =
      routes.length > 1
        ? [
            {
              pool_id: routes[0]?.pool.id,
              token_in: fromTokenAddress,
              token_out: transitTokenAddress,
              amountIn: fromAmountIn,
              min_amount_out: '0'
            },
            {
              pool_id: routes[1]?.pool.id,
              token_in: transitTokenAddress,
              token_out: toTokenAddress,
              min_amount_out: minAmountOut
            }
          ]
        : [
            {
              pool_id: routes[0]?.pool.id,
              token_in: fromTokenAddress,
              token_out: toTokenAddress,
              min_amount_out: minAmountOut
            }
          ];

    const tokenInActions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: fromAmountIn,
          msg: JSON.stringify({ force: 0, actions })
        },
        gas: DEFAULT_TRANSFER_CALL_GAS,
        amount: ONE_YOCTO_NEAR
      }
    ];

    return {
      receiverId: fromTokenAddress,
      functionCalls: tokenInActions
    };
  }

  /**
   * Creates swap transaction.
   * @param trade Trade object.
   */
  public async createDepositTransactions(trade: InstantTrade): Promise<NearTransaction[]> {
    const transactions: NearTransaction[] = [];
    if (!trade?.from) {
      return transactions;
    }
    if (trade.from.token.address === NATIVE_NEAR_ADDRESS) {
      const account = new WalletConnection(
        this.walletConnectorService.nearConnection,
        'rubic'
      ).account();
      const wrappedNearBalance = await account.viewFunction(
        WRAP_NEAR_CONTRACT,
        'storage_balance_of',
        {
          account_id: account.accountId
        }
      );
      if (
        !wrappedNearBalance ||
        wrappedNearBalance.total === '0' ||
        trade.from.amount.lt(Web3Pure.fromWei(wrappedNearBalance.total))
      ) {
        transactions.push({
          receiverId: WRAP_NEAR_CONTRACT,
          functionCalls: [
            {
              methodName: 'near_deposit',
              args: {},
              gas: DEFAULT_NEAR_DEPOSIT_GAS,
              amount: trade.from.amount.toString()
            }
          ]
        });
      }
    }

    return transactions;
  }

  /**
   * Gets stable pool information.
   * @param pool_id Pool identifier.
   */
  public async getStablePool(pool_id: number): Promise<RefStablePool> {
    const account = new WalletConnection(this.walletConnectorService.nearConnection, 'rubic');

    const pool_info = await account
      .account()
      .viewFunction(REF_FI_CONTRACT_ID, 'get_stable_pool', { pool_id });

    return {
      ...pool_info,
      id: pool_id
    };
  }
}
