import { Injectable } from '@angular/core';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { from, Observable, of } from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { startWith } from 'rxjs/operators';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { subtractPercent } from 'src/app/shared/utils/utils';
import { Web3Pure } from 'src/app/core/services/blockchain/web3/web3-pure/web3-pure';
import { LiquidityPoolsController } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/utils/liquidity-pool-controller/LiquidityPoolsController';
import {
  algebraContractData,
  maxTransitTokens,
  wethAddressNetMode
} from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/algebra-constants';
import { AlgebraRoute } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/models/AlgebraRoute';
import { AlgebraInstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/models/AlgebraInstantTrade';

/**
 * Shows whether Eth is used as from or to token.
 */
interface IsEthFromOrTo {
  from: boolean;
  to: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlgebraService implements ItProvider {
  /**
   * Amount by which estimated gas should be increased (1.2 = 120%).
   */
  private readonly gasMargin: number;

  private readonly blockchain: BLOCKCHAIN_NAME;

  private web3Public: Web3Public;

  private liquidityPoolsController: LiquidityPoolsController;

  private wethAddress: string;

  private settings: ItSettingsForm;

  private walletAddress: string;

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly settingsService: SettingsService,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.gasMargin = 1.2;

    this.blockchain = BLOCKCHAIN_NAME.POLYGON;
    this.web3Public = this.web3PublicService[this.blockchain];
    this.liquidityPoolsController = new LiquidityPoolsController(this.web3Public);
    this.wethAddress = wethAddressNetMode.mainnet;

    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = {
          ...settingsForm,
          slippageTolerance: settingsForm.slippageTolerance / 100
        };
      });

    this.authService.getCurrentUser().subscribe(user => {
      this.walletAddress = user?.address;
    });

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.web3Public = this.web3PublicService[this.blockchain];
        this.liquidityPoolsController = new LiquidityPoolsController(this.web3Public, true);
        this.wethAddress = wethAddressNetMode.testnet;
      }
    });
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    if (Web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      this.web3Public.getAllowance(
        tokenAddress,
        this.walletAddress,
        algebraContractData.swapRouter.address
      )
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      algebraContractData.swapRouter.address,
      'infinity',
      options
    );
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<AlgebraInstantTrade> {
    const { fromTokenWrapped, toTokenWrapped } = this.getWrappedTokens(fromToken, toToken);
    const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);

    const route = await this.getRoute(fromTokenWrapped, fromAmountAbsolute, toTokenWrapped);

    return {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      route
    };
  }

  /**
   * Returns passed tokens with updated addresses to use in contracts.
   * @param fromToken From token.
   * @param toToken To token.
   */
  private getWrappedTokens(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): {
    fromTokenWrapped: InstantTradeToken;
    toTokenWrapped: InstantTradeToken;
    isEth: IsEthFromOrTo;
  } {
    const fromTokenWrapped = { ...fromToken };
    const toTokenWrapped = { ...toToken };
    const isEth: IsEthFromOrTo = {} as IsEthFromOrTo;
    if (Web3Public.isNativeAddress(fromToken.address)) {
      fromTokenWrapped.address = this.wethAddress;
      isEth.from = true;
    }
    if (Web3Public.isNativeAddress(toToken.address)) {
      toTokenWrapped.address = this.wethAddress;
      isEth.to = true;
    }
    return {
      fromTokenWrapped,
      toTokenWrapped,
      isEth
    };
  }

  /**
   * Returns most profitable route.
   * @param fromToken From token.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toToken To token.
   */
  private async getRoute(
    fromToken: InstantTradeToken,
    fromAmountAbsolute: string,
    toToken: InstantTradeToken
  ): Promise<AlgebraRoute> {
    const routes = (
      await this.liquidityPoolsController.getAllRoutes(
        fromAmountAbsolute,
        fromToken,
        toToken,
        this.settings.disableMultihops ? 0 : maxTransitTokens
      )
    ).sort((a, b) => b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount));

    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }
    return routes[0];
  }

  /**
   * Returns swap method's name and argument to use in Swap contract.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param walletAddress Wallet address, making swap.
   * @param deadline Deadline of swap in seconds.
   */
  private getSwapRouterExactInputMethodParams(
    route: AlgebraRoute,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData {
    const amountOutMin = subtractPercent(
      route.outputAbsoluteAmount,
      this.settings.slippageTolerance
    ).toFixed(0);

    if (route.path.length === 2) {
      return {
        methodName: 'exactInputSingle',
        methodArguments: [
          [
            route.path[0].address,
            toTokenAddress,
            walletAddress,
            deadline,
            fromAmountAbsolute,
            amountOutMin,
            0
          ]
        ]
      };
    }
    return {
      methodName: 'exactInput',
      methodArguments: [
        [
          LiquidityPoolsController.getEncodedPath(route.path),
          walletAddress,
          deadline,
          fromAmountAbsolute,
          amountOutMin
        ]
      ]
    };
  }

  public async createTrade(
    trade: AlgebraInstantTrade,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const fromToken = trade.from.token;
    const toToken = trade.to.token;
    const fromAmountAbsolute = Web3Public.toWei(trade.from.amount, trade.from.token.decimals);
    const { toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    return this.swapTokens(trade, fromAmountAbsolute, toTokenWrapped.address, isEth, options);
  }

  /**
   * Executes swap method in Swap contract.
   * @param trade Uniswap v3 trade.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param options Instant trade options.
   */
  private async swapTokens(
    trade: AlgebraInstantTrade,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const { route } = trade;
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const amountOutMin = subtractPercent(
      route.outputAbsoluteAmount,
      this.settings.slippageTolerance
    ).toFixed(0);

    let methodName: string;
    let methodArguments: unknown[];
    if (!isEth.to) {
      const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
        this.getSwapRouterExactInputMethodParams(
          route,
          fromAmountAbsolute,
          toTokenAddress,
          this.walletAddress,
          deadline
        );
      methodName = exactInputMethodName;
      methodArguments = exactInputMethodArguments;
    } else {
      const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
        this.getSwapRouterExactInputMethodParams(
          route,
          fromAmountAbsolute,
          toTokenAddress,
          NATIVE_TOKEN_ADDRESS,
          deadline
        );
      const exactInputMethodEncoded = await Web3Pure.encodeFunctionCall(
        algebraContractData.swapRouter.abi,
        exactInputMethodName,
        exactInputMethodArguments
      );
      const unwrapWETHMethodEncoded = await Web3Pure.encodeFunctionCall(
        algebraContractData.swapRouter.abi,
        'unwrapWNativeToken',
        [amountOutMin, this.walletAddress]
      );

      methodName = 'multicall';
      methodArguments = [[exactInputMethodEncoded, unwrapWETHMethodEncoded]];
    }

    return this.web3PrivateService.tryExecuteContractMethod(
      algebraContractData.swapRouter.address,
      algebraContractData.swapRouter.abi,
      methodName,
      methodArguments,
      {
        value: isEth.from ? fromAmountAbsolute : undefined,
        onTransactionHash: options.onConfirm,
        gas: trade.gasLimit,
        gasPrice: trade.gasPrice
      }
    );
  }
}
