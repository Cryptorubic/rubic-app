import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { forkJoin, from, Observable, of } from 'rxjs';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { RefFinancePoolsService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance-pools.service';
import { RefPool } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-pool';
import { RefFiFunctionCallOptions } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-function-calls';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WalletConnection } from 'near-api-js';
import {
  DEFAULT_TRANSFER_CALL_GAS,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  WRAP_NEAR_CONTRACT
} from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';
import { first, map, startWith } from 'rxjs/operators';
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
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { compareAddresses } from '@shared/utils/utils';

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
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly settingsService: SettingsService
  ) {
    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = {
          ...settingsForm,
          slippageTolerance: settingsForm.slippageTolerance / 100
        };
      });
    this.handleNearQueryParams();
  }

  public async approve(): Promise<void> {
    const amount = this.swapFormService.inputValue.fromAmount;
    return this.wrapNear(amount);
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

  public async createTrade(trade: InstantTrade): Promise<unknown> {
    if (this.isWrap(trade.from.token.address, trade.to.token.address)) {
      if (trade.from.token.address === NATIVE_NEAR_ADDRESS) {
        await this.wrapNear(trade.from.amount);
      } else {
        await this.unwrapNear(trade.from.amount);
      }
    }
    const pool = this._currentTradePool;

    const fromAmountIn = Web3Pure.toWei(trade.from.amount, trade.from.token.decimals);
    const amountOutWithSlippage = trade.to.amount.multipliedBy(1 - this.settings.slippageTolerance);
    const minAmountOut = Web3Pure.toWei(amountOutWithSlippage, trade.to.token.decimals);

    const fromTokenAddress =
      trade.from.token.address === NATIVE_NEAR_ADDRESS
        ? WRAP_NEAR_CONTRACT
        : trade.from.token.address;
    const toTokenAddress =
      trade.to.token.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : trade.to.token.address;

    const swapAction = {
      pool_id: pool?.id,
      token_in: fromTokenAddress,
      token_out: toTokenAddress,
      min_amount_out: minAmountOut
    };

    const transactions: NearTransaction[] = [];

    const account = new WalletConnection(
      this.walletConnectorService.nearConnection,
      'rubic'
    ).account();

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
          gas: '30000000000000',
          amount: '0.1'
        }
      ];

      transactions.push({
        receiverId: toTokenAddress,
        functionCalls: tokenOutActions
      });
    }

    const tokenInActions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: fromAmountIn,
          msg: JSON.stringify({ force: 0, actions: swapAction })
        },
        gas: DEFAULT_TRANSFER_CALL_GAS,
        amount: ONE_YOCTO_NEAR
      }
    ];

    transactions.push({
      receiverId: fromTokenAddress,
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

  public getAllowance(address: string): Observable<BigNumber> {
    if (compareAddresses(address, 'near')) {
      const adapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.NEAR];
      return from(
        adapter.getTokenOrNativeBalance(this.walletConnectorService.address, WRAP_NEAR_CONTRACT)
      ).pipe(map(allowance => Web3Pure.fromWei(allowance, 24)));
    }
    return of(new BigNumber(NaN));
  }

  private async wrapNear(amount: BigNumber): Promise<void> {
    const stringAmount = amount.toString();
    const transactions: NearTransaction[] = [
      {
        receiverId: WRAP_NEAR_CONTRACT,
        functionCalls: [
          {
            methodName: 'near_deposit',
            args: {},
            gas: '50000000000000',
            amount: stringAmount
          }
        ]
      }
    ];

    await this.nearPrivateAdapter.executeMultipleTransactions(
      transactions,
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      stringAmount
    );
  }

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

    await this.nearPrivateAdapter.executeMultipleTransactions(
      transactions,
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      weiAmount
    );
  }

  /**
   * Can tokens be wrapped or unwrapped.
   * @param fromAddress From token address.
   * @param toAddress To token address.
   */
  private isWrap(fromAddress: string, toAddress: string): boolean {
    return (
      (fromAddress.toLowerCase() === NATIVE_NEAR_ADDRESS &&
        toAddress.toLowerCase() === WRAP_NEAR_CONTRACT) ||
      (fromAddress.toLowerCase() === WRAP_NEAR_CONTRACT && toAddress === NATIVE_NEAR_ADDRESS)
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
    const fromTokenAddress =
      fromToken.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : fromToken.address;
    const toTokenAddress =
      toToken.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : toToken.address;

    return Promise.all(
      pools.map(pool => {
        const amountWithFee = fromAmount.multipliedBy(FEE_DIVISOR - pool.fee);
        const inBalance = Web3Pure.fromWei(pool.supplies[fromTokenAddress], fromToken.decimals);
        const outBalance = Web3Pure.fromWei(pool.supplies[toTokenAddress], toToken.decimals);
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

      this.postNearTransaction(nearParams.hash, nearParams.type);
    });
  }

  /**
   * Posts near transaction params to api.
   * @param txHash Transaction hash.
   */
  private async postNearTransaction(txHash: string, type: SWAP_PROVIDER_TYPE): Promise<void> {
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

      // type ItRequest = {
      //   actions?: {
      //     min_amount_out: string;
      //     pool_id: number;
      //     token_in: string;
      //     token_out: string;
      //   };
      // };

      // type swapToParams = {};

      // type CcrRequest = {
      //   SwapTokensToOther:
      //     | {
      //         swap_actions: [];
      //         swap_to_params: [];
      //       }
      //     | {
      //         SwapTransferTokensToOther: {
      //           swap_to_params: [];
      //         };
      //       };
      // };

      // const msg: ItRequest | CcrRequest = JSON.parse(paramsObject?.msg);

      const actions: {
        min_amount_out: string;
        pool_id: number;
        token_in: string;
        token_out: string;
      } =
        type === SWAP_PROVIDER_TYPE.INSTANT_TRADE
          ? JSON.parse(paramsObject?.msg)?.actions?.[0]
          : JSON.parse(paramsObject?.msg)?.actions?.[0];

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
