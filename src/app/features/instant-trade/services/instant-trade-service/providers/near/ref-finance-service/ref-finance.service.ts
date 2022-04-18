import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { forkJoin, of } from 'rxjs';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { RefFinancePoolsService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance-pools.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  REF_FI_CONTRACT_ID,
  WRAP_NEAR_CONTRACT
} from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';
import { first, startWith, switchMap } from 'rxjs/operators';
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
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { SwapFormInput } from '@features/swaps/models/swap-form';
import { RefFinanceSwapService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance-swap.service';
import { RefFinanceRoute } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-finance-route';
import { NearTransactionType } from '@core/services/blockchain/blockchain-adapters/near/models/near-transaction-type';

interface SwapParams {
  msg: string;
  amount: string;
  receiver_id: string;
}

type ItRequest = {
  actions?: {
    min_amount_out: string;
    pool_id: number;
    token_in: string;
    token_out: string;
  }[];
};

type CcrRequest = {
  SwapTokensToOther:
    | {
        swap_actions: [];
        swap_to_params: [];
      }
    | {
        SwapTransferTokensToOther: {
          swap_to_params: [];
        };
      };
};

@Injectable({
  providedIn: 'root'
})
export class RefFinanceService implements ItProvider {
  public readonly providerType = INSTANT_TRADE_PROVIDER.REF;

  public readonly contractAddress = REF_FI_CONTRACT_ID;

  private settings: ItSettingsForm;

  private _refRoutes: [RefFinanceRoute, RefFinanceRoute] | [RefFinanceRoute];

  public get refRoutes(): [RefFinanceRoute, RefFinanceRoute] | [RefFinanceRoute] {
    return this._refRoutes;
  }

  private set refRoutes(routes: [RefFinanceRoute, RefFinanceRoute] | [RefFinanceRoute]) {
    this._refRoutes = routes;
  }

  /**
   * Parses Instant Trade swap params.
   * @param msg Instant trade request.
   * @param form Trade form.
   * @param fromAmount fromAmount.
   */
  private static async parseInstantTradeParams(
    msg: ItRequest,
    form: SwapFormInput,
    fromAmount: string
  ): Promise<InstantTrade> {
    const routeIndex = msg.actions.length > 1 ? 1 : 0;
    const tokenIn = msg.actions[0].token_in;
    const tokenOut = msg.actions[routeIndex].token_out;
    const toAmount = msg.actions[routeIndex].min_amount_out;

    return {
      blockchain: BLOCKCHAIN_NAME.NEAR,
      from: {
        token: {
          address: tokenIn,
          symbol: form.fromToken.symbol || tokenIn,
          decimals: 1
        },
        amount: new BigNumber(fromAmount)
      },
      to: {
        token: {
          address: tokenOut,
          symbol: form.toToken.symbol || tokenOut,
          decimals: 1
        },
        amount: new BigNumber(toAmount)
      }
    };
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
    private readonly settingsService: SettingsService,
    private readonly refFinanceSwapService: RefFinanceSwapService
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
    return;
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    if (RefFinanceSwapService.isWrap(fromToken.address, toToken.address)) {
      return RefFinanceSwapService.getWrapTrade(fromToken, toToken, fromAmount);
    }

    try {
      const pools = await this.refFinancePoolsService.getPoolsByTokens(
        fromToken,
        fromAmount,
        toToken
      );

      if (!pools.length) {
        const transitToken: InstantTradeToken = {
          address: 'wrap.near',
          decimals: 24,
          symbol: 'wNEAR'
        };

        const fromPools = await this.refFinancePoolsService.getPoolsByTokens(
          fromToken,
          fromAmount,
          transitToken
        );

        const fromRoute = await this.refFinanceSwapService.getRoutes(
          fromPools,
          fromAmount,
          fromToken,
          transitToken
        );
        const transitAmount = new BigNumber(fromRoute.estimate);

        const toPools = await this.refFinancePoolsService.getPoolsByTokens(
          transitToken,
          transitAmount,
          toToken
        );
        const toRoute = await this.refFinanceSwapService.getRoutes(
          toPools,
          transitAmount,
          transitToken,
          toToken
        );

        this.refRoutes = [fromRoute, toRoute];
        return RefFinanceSwapService.getTransitTrade(
          fromToken,
          transitToken,
          toToken,
          fromAmount,
          toRoute.estimate
        );
      }

      this.refRoutes = [
        await this.refFinanceSwapService.getRoutes(pools, fromAmount, fromToken, toToken)
      ];
      return RefFinanceSwapService.getDirectTrade(
        fromToken,
        toToken,
        fromAmount,
        this.refRoutes[0].estimate
      );
    } catch (err) {
      new InsufficientLiquidityError('InstantTrade');
    }
    throw new InsufficientLiquidityError('CrossChainRouting');
  }

  public async createTrade(trade: InstantTrade): Promise<unknown> {
    await this.refFinanceSwapService.handleWrap(trade);

    const fromAmountIn = Web3Pure.toWei(trade.from.amount, trade.from.token.decimals);
    const amountOutWithSlippage = trade.to.amount.multipliedBy(1 - this.settings.slippageTolerance);
    const minAmountOut = Web3Pure.toWei(amountOutWithSlippage, trade.to.token.decimals);

    const fromTokenAddress =
      trade.from.token.address === NATIVE_NEAR_ADDRESS
        ? WRAP_NEAR_CONTRACT
        : trade.from.token.address;
    const toTokenAddress =
      trade.to.token.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : trade.to.token.address;

    const registerTokensTransactions =
      await this.refFinanceSwapService.createRegisterTokensTransactions(
        toTokenAddress,
        fromTokenAddress,
        this.refRoutes,
        SWAP_PROVIDER_TYPE.INSTANT_TRADE
      );
    const depositTransactions = await this.refFinanceSwapService.createDepositTransactions(trade);
    const swapTransaction = await this.refFinanceSwapService.createSwapTransaction(
      fromAmountIn,
      fromTokenAddress,
      toTokenAddress,
      minAmountOut,
      this.refRoutes
    );

    await this.nearPrivateAdapter.executeMultipleTransactions(
      [...registerTokensTransactions, ...depositTransactions, swapTransaction],
      'it',
      minAmountOut
    );

    return new Promise(resolve => {
      setTimeout(() => resolve(''), 2000);
    });
  }

  public async getAllowance(): Promise<BigNumber> {
    return new BigNumber(Infinity);
  }

  /**
   * Handles near query params, shows success or error notification.
   */
  private handleNearQueryParams(): void {
    const form$ = this.swapFormService.inputValueChanges.pipe(first(el => el !== null));
    const nearParams$ = this.queryParamsService.nearQueryParams$.pipe(first(el => el !== null));

    forkJoin([form$, nearParams$])
      .pipe(
        switchMap(([form, nearParams]) => {
          const { fromToken, toToken, fromAmount } = form;
          if (!fromToken || !toToken || !fromAmount || 'allKeys' in nearParams) {
            return of(null);
          }

          if ('errorCode' in nearParams) {
            const error = decodeURI(nearParams.errorMessage);
            if (error.includes('reject')) {
              this.errorsService.catch(new UserRejectError());
            } else {
              this.errorsService.catch(new CustomError(error));
            }
            return of(null);
          }

          return this.postNearTransaction(nearParams.hash, nearParams.type, form);
        })
      )
      .subscribe(() => {});
  }

  /**
   * Posts near transaction params to api.
   * @param txHash Transaction hash.
   * @param type Transaction swap type.
   * @param form Swap form.
   */
  private async postNearTransaction(
    txHash: string,
    type: NearTransactionType,
    form: SwapFormInput
  ): Promise<void> {
    try {
      const provider =
        type === 'ccr' ? SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING : SWAP_PROVIDER_TYPE.INSTANT_TRADE;

      const paramsObject = await this.parseSwapParams(txHash);
      if (!paramsObject) {
        throw new CustomError('Cant parse transaction');
      }

      this.gtmService.fireTxSignedEvent(provider, txHash);

      if (type === 'it' || type === 'ccr') {
        const msg: ItRequest | CcrRequest = JSON.parse(paramsObject?.msg);

        if ('actions' in msg) {
          const trade = await RefFinanceService.parseInstantTradeParams(
            msg,
            form,
            paramsObject.amount
          );

          await this.instantTradesApiService
            .createTrade(txHash, INSTANT_TRADE_PROVIDER.REF, trade)
            .toPromise();

          try {
            await this.instantTradesApiService.notifyInstantTradesBot({
              provider: INSTANT_TRADE_PROVIDER.REF,
              blockchain: BLOCKCHAIN_NAME.NEAR,
              walletAddress: paramsObject.receiver_id,
              trade,
              txHash
            });
          } catch {
            console.debug('Near transaction bot failed');
          }
        }
      }

      this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
        status: TuiNotification.Success,
        autoClose: 10000
      });
    } catch (err: unknown) {
      console.debug(err);
    }
  }

  /**
   * Fetch instant trade transaction from blockchain by hash.
   * @param hash Transaction hash.
   */
  private async parseSwapParams(hash: string): Promise<SwapParams> {
    const adapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.NEAR];

    const trx = await adapter.getTransactionByHash(hash);
    const params = new Buffer(
      trx.transaction?.actions?.[0]?.FunctionCall.args,
      'base64'
    ).toString();

    return JSON.parse(params);
  }
}
