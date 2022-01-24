import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { forkJoin, Observable, of } from 'rxjs';
import { ItSettingsForm } from '@features/swaps/services/settings-service/settings.service';
import { WRAPPED_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { RefFinancePoolsService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance-pools.service';
import { RefPool } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-pool';
import { RefFiFunctionCallOptions } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-function-calls';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WalletConnection } from 'near-api-js';
import { REF_FI_CONTRACT_ID } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';
import { first } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { InstantTradesApiService } from '@core/services/backend/instant-trades-api/instant-trades-api.service';
import { ErrorsService } from '@core/errors/errors.service';
import CustomError from '@core/errors/models/custom-error';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import {
  NATIVE_NEAR_ADDRESS,
  NATIVE_SOLANA_MINT_ADDRESS
} from '@shared/constants/blockchain/native-token-address';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';

export interface NearTransaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

interface RefFinanceRoute {
  estimate: string;
  pool: RefPool;
}

@Injectable({
  providedIn: 'root'
})
export class RefFinanceService implements ItProvider {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.REF;

  private settings: ItSettingsForm;

  private _currentTradePool: RefPool;

  public get currentTradePool(): RefPool {
    return this._currentTradePool;
  }

  private readonly oneYoctoNear: string = '0.000000000000000000000001';

  constructor(
    private readonly refFinancePoolsService: RefFinancePoolsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly nearPrivateAdapter: NearWeb3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly notificationsService: NotificationsService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly errorsService: ErrorsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {
    this.handleNearQueryParams();
  }

  public async getFromAmount(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    aIn: BigNumber
  ): Promise<BigNumber> {
    console.log(fromToken, toToken, aIn);
    return null;
    // const pool = this.raydiumRoutingService.currentPoolInfo;
    // const { amountOut } = this.raydiumRoutingService.getSwapOutAmount(
    //   pool,
    //   fromToken.address,
    //   toToken.address,
    //   aIn.toString(),
    //   this.settings.slippageTolerance
    // );
    // return new BigNumber(aIn)
    //   .multipliedBy(100)
    //   .dividedBy(amountOut)
    //   .multipliedBy(10 ** fromToken.decimals);
  }

  public approve(): Promise<void> {
    return;
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    if (this.isWrap(fromToken.address, toToken.address)) {
      return {
        blockchain: BLOCKCHAIN_NAME.NEAR,
        from: {
          token: fromToken,
          amount: fromAmount
        },
        to: {
          token: toToken,
          amount: fromAmount
        },
        path: [
          { symbol: fromToken.symbol, address: fromToken.address },
          { symbol: toToken.symbol, address: toToken.address }
        ]
      };
    }

    try {
      const pools = await this.refFinancePoolsService.getPoolsByTokens(
        fromToken,
        fromAmount,
        toToken
      );

      const routes = await this.getRoutes(pools, fromAmount, fromToken, toToken);
      const { estimate, pool } = routes.sort((a, b) =>
        new BigNumber(b.estimate).gt(a.estimate) ? 1 : -1
      )[0];

      this._currentTradePool = pool;

      return {
        blockchain: BLOCKCHAIN_NAME.NEAR,
        from: {
          token: fromToken,
          amount: fromAmount
        },
        to: {
          token: toToken,
          amount: new BigNumber(estimate)
        },
        path: [
          { symbol: fromToken.symbol, address: pool.tokenIds[0] },
          { symbol: toToken.symbol, address: pool.tokenIds[1] }
        ]
      };
    } catch (err) {
      new InsufficientLiquidityError('InstantTrade');
    }
    throw new InsufficientLiquidityError('CrossChainRouting');
  }

  public async createTrade(trade: InstantTrade): Promise<{}> {
    const pool = this._currentTradePool;
    const minAmountOut = Web3Pure.toWei(trade.to.amount, trade.to.token.decimals);
    const swapAction = {
      pool_id: pool?.id,
      token_in: trade.from.token.address,
      token_out: trade.to.token.address,
      min_amount_out: minAmountOut
    };

    const transactions: NearTransaction[] = [];

    const account = new WalletConnection(
      this.walletConnectorService.nearConnection,
      'rubic'
    ).account();

    const tokenOutRegistered = await account.viewFunction(
      trade.to.token.address,
      'storage_balance_of',
      { account_id: account.accountId }
    );

    if (!tokenOutRegistered || tokenOutRegistered.total === '0') {
      const tokenOutActions: RefFiFunctionCallOptions[] = [
        {
          methodName: 'storage_deposit',
          args: {
            registration_only: true,
            account_id: account.accountId
          },
          gas: '30000000000000',
          amount: '0.1'
        }
      ];

      transactions.push({
        receiverId: trade.to.token.address,
        functionCalls: tokenOutActions
      });
    }

    const tokenInActions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: Web3Pure.toWei(trade.from.amount, trade.from.token.decimals),
          msg: JSON.stringify({
            force: 0,
            actions: [swapAction]
          })
        },
        gas: '150000000000000',
        amount: this.oneYoctoNear
      }
    ];

    transactions.push({
      receiverId: trade.from.token.address,
      functionCalls: tokenInActions
    });

    await this.nearPrivateAdapter.executeMultipleTransactions(
      transactions,
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      minAmountOut
    );

    return new Promise(resolve => {
      setTimeout(() => resolve(''), 2000);
    });
  }

  public getAllowance(): Observable<BigNumber> {
    return of(new BigNumber(NaN));
  }

  /**
   * @TODO Fix near.
   * @param fromAddress
   * @param toAddress
   * @private
   */
  private isWrap(fromAddress: string, toAddress: string): boolean {
    return (
      (fromAddress === NATIVE_NEAR_ADDRESS && toAddress === WRAPPED_SOL.mintAddress) ||
      (fromAddress === WRAPPED_SOL.mintAddress && toAddress === NATIVE_SOLANA_MINT_ADDRESS)
    );
  }

  /**
   * Gets all ref finance routes.
   * @param pools Available pools.
   * @param fromAmount Tokens from amount.
   * @param fromToken From token.
   * @param toToken To token.
   * @return Promise<RefFinanceRoute[]> Array of routes.
   */
  private async getRoutes(
    pools: RefPool[],
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<RefFinanceRoute[]> {
    const FEE_DIVISOR = 10000;

    return Promise.all(
      pools.map(pool => {
        const amountWithFee = fromAmount.multipliedBy(FEE_DIVISOR - pool.fee);
        const inBalance = Web3Pure.fromWei(pool.supplies[fromToken.address], fromToken.decimals);
        const outBalance = Web3Pure.fromWei(pool.supplies[toToken.address], toToken.decimals);
        const estimate = amountWithFee
          .multipliedBy(outBalance)
          .dividedBy(new BigNumber(inBalance).multipliedBy(FEE_DIVISOR).plus(amountWithFee))
          .toString();

        return { estimate, pool };
      })
    );
  }

  /**
   * Handles near query params, shows success or error notification.
   */
  private handleNearQueryParams(): void {
    const form$ = this.swapFormService.inputValueChanges.pipe(first(el => el !== null));
    const nearParams$ = this.queryParamsService.nearQueryParams$.pipe(first(el => el !== null));

    forkJoin([form$, nearParams$]).subscribe(([form, nearParams]) => {
      const { fromToken, toToken, fromAmount } = form;
      if (!fromToken || !toToken || !fromAmount || 'allKeys' in nearParams) {
        return;
      }

      if ('errorCode' in nearParams) {
        const error = decodeURI(nearParams.errorMessage);
        if (error.includes('reject')) {
          this.errorsService.catch(new UserRejectError());
        } else {
          this.errorsService.catch(new CustomError(error));
        }
        return;
      }

      this.postNearTransaction(nearParams.hash);
    });
  }

  /**
   * Posts near transaction params to api.
   * @param txHash Transaction hash.
   */
  private async postNearTransaction(txHash: string): Promise<void> {
    try {
      this.gtmService.notifySignTransaction();
      const adapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.NEAR];

      const trx = await adapter.getTransactionByHash(txHash);
      const params = new Buffer(
        trx.transaction?.actions?.[0]?.FunctionCall.args,
        'base64'
      ).toString();
      const paramsObject: {
        amount: string;
        msg: string;
        receiver_id: string;
      } = JSON.parse(params);

      const actions: {
        min_amount_out: string;
        pool_id: number;
        token_in: string;
        token_out: string;
      } = JSON.parse(paramsObject?.msg)?.actions?.[0];

      const trade: InstantTrade = {
        blockchain: BLOCKCHAIN_NAME.NEAR,
        from: {
          token: {
            address: actions.token_in,
            symbol: actions.token_in,
            decimals: 1
          },
          amount: new BigNumber(paramsObject.amount)
        },
        to: {
          token: {
            address: actions.token_out,
            symbol: actions.token_out,
            decimals: 1
          },
          amount: new BigNumber(actions.min_amount_out)
        }
      };

      await this.instantTradesApiService
        .createTrade(txHash, INSTANT_TRADES_PROVIDERS.REF, trade, BLOCKCHAIN_NAME.NEAR)
        .toPromise();

      this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
        status: TuiNotification.Success,
        autoClose: 10000
      });

      await this.instantTradesApiService.notifyInstantTradesBot({
        provider: INSTANT_TRADES_PROVIDERS.REF,
        blockchain: BLOCKCHAIN_NAME.NEAR,
        walletAddress: paramsObject.receiver_id,
        trade,
        txHash
      });
    } catch (err: unknown) {
      console.debug(err);
    }
  }
}
