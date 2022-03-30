import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/services/settings-service/settings.service';
import { from, Observable, of } from 'rxjs';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { startWith } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { TransactionReceipt } from 'web3-eth';
import { subtractPercent } from '@shared/utils/utils';
import {
  UniswapV3AlgebraInstantTrade,
  UniswapV3AlgebraRoute
} from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3-algebra/common-service/models/uniswap-v3-algebra-instant-trade';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { UniswapV3AlgebraConstants } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3-algebra/common-service/models/uniswap-v3-algebra-constants';
import { ContractData } from '@shared/models/blockchain/contract-data';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { MethodData } from '@shared/models/blockchain/method-data';
import { IsEthFromOrTo } from '@features/instant-trade/services/instant-trade-service/models/is-eth-from-or-to';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';

import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { EthLikeWeb3Pure } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { RequiredField } from '@shared/models/utility-types/required-field';

@Injectable()
export abstract class CommonUniswapV3AlgebraService implements ItProvider {
  public abstract readonly providerType: INSTANT_TRADE_PROVIDER;

  protected abstract readonly unwrapWethMethodName: 'unwrapWETH9' | 'unwrapWNativeToken';

  protected readonly blockchain: EthLikeBlockchainName;

  protected blockchainAdapter: EthLikeWeb3Public;

  private readonly wethAddress: string;

  protected readonly swapRouterContract: ContractData;

  protected settings: ItSettingsForm;

  protected walletAddress: string;

  public get contractAddress(): string {
    return this.swapRouterContract.address;
  }

  // Injected services
  private readonly publicBlockchainAdapterService = inject(PublicBlockchainAdapterService);

  private readonly web3PrivateService = inject(EthLikeWeb3PrivateService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly authService = inject(AuthService);

  private readonly settingsService = inject(SettingsService);

  protected constructor(uniswapV3Constants: UniswapV3AlgebraConstants) {
    this.blockchain = uniswapV3Constants.blockchain;

    this.blockchainAdapter = this.publicBlockchainAdapterService[this.blockchain];

    this.wethAddress = uniswapV3Constants.wethAddress;
    this.swapRouterContract = uniswapV3Constants.swapRouterContract;

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
  }

  public getAllowance(
    tokenAddress: string,
    targetContractAddress = this.contractAddress
  ): Observable<BigNumber> {
    if (this.blockchainAdapter.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }

    return from(
      this.blockchainAdapter.getAllowance({
        tokenAddress,
        ownerAddress: this.walletAddress,
        spenderAddress: targetContractAddress
      })
    );
  }

  public async approve(
    tokenAddress: string,
    options: TransactionOptions,
    targetContractAddress = this.contractAddress
  ): Promise<void> {
    this.walletConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      targetContractAddress,
      'infinity',
      options
    );
  }

  public abstract calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade>;

  /**
   * Returns passed tokens with updated addresses to use in contracts.
   * @param fromToken From token.
   * @param toToken To token.
   */
  protected getWrappedTokens(
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

    if (this.blockchainAdapter.isNativeAddress(fromToken.address)) {
      fromTokenWrapped.address = this.wethAddress;
      isEth.from = true;
    }
    if (this.blockchainAdapter.isNativeAddress(toToken.address)) {
      toTokenWrapped.address = this.wethAddress;
      isEth.to = true;
    }

    return {
      fromTokenWrapped,
      toTokenWrapped,
      isEth
    };
  }

  public async createTrade(
    trade: UniswapV3AlgebraInstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    const { methodName, methodArguments, transactionOptions } = await this.checkAndGetTradeData(
      trade,
      options
    );

    return this.web3PrivateService.tryExecuteContractMethod(
      this.swapRouterContract.address,
      this.swapRouterContract.abi,
      methodName,
      methodArguments,
      transactionOptions
    );
  }

  public async checkAndEncodeTrade(
    trade: UniswapV3AlgebraInstantTrade,
    options: ItOptions,
    receiverAddress: string
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    const { methodName, methodArguments, transactionOptions } = await this.checkAndGetTradeData(
      trade,
      options,
      receiverAddress
    );

    return {
      ...transactionOptions,
      data: EthLikeWeb3Pure.encodeFunctionCall(
        this.swapRouterContract.abi,
        methodName,
        methodArguments
      )
    };
  }

  private async checkAndGetTradeData(
    trade: UniswapV3AlgebraInstantTrade,
    options: ItOptions,
    receiverAddress = this.walletAddress
  ): Promise<{
    methodName: string;
    methodArguments: unknown[];
    transactionOptions?: TransactionOptions;
  }> {
    this.walletConnectorService.checkSettings(this.blockchain);
    await this.blockchainAdapter.checkBalance(
      trade.from.token,
      trade.from.amount,
      this.walletAddress
    );

    const fromToken = trade.from.token;
    const toToken = trade.to.token;
    const fromAmountAbsolute = Web3Pure.toWei(trade.from.amount, trade.from.token.decimals);
    const { toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const { methodName, methodArguments } = this.getSwapRouterMethodData(
      trade.route,
      fromAmountAbsolute,
      toTokenWrapped.address,
      isEth,
      deadline,
      receiverAddress
    );
    const transactionOptions = {
      value: isEth.from ? fromAmountAbsolute : undefined,
      onTransactionHash: options.onConfirm,
      gas: trade.gasLimit,
      gasPrice: trade.gasPrice
    };

    return {
      methodName,
      methodArguments,
      transactionOptions
    };
  }

  /**
   * Returns swap method's name and arguments to use in Swap contract.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param deadline Deadline of swap in seconds.
   * @param receiverAddress Address to receive tokens.
   */
  protected getSwapRouterMethodData(
    route: UniswapV3AlgebraRoute,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    deadline: number,
    receiverAddress = this.walletAddress
  ): MethodData {
    if (!isEth.to) {
      return this.getSwapRouterExactInputMethodParams(
        route,
        fromAmountAbsolute,
        toTokenAddress,
        receiverAddress,
        deadline
      );
    }

    const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
      this.getSwapRouterExactInputMethodParams(
        route,
        fromAmountAbsolute,
        toTokenAddress,
        NATIVE_TOKEN_ADDRESS,
        deadline
      );

    const exactInputMethodEncoded = EthLikeWeb3Pure.encodeFunctionCall(
      this.swapRouterContract.abi,
      exactInputMethodName,
      exactInputMethodArguments
    );

    const amountOutMin = this.getAmountOutMin(route);
    const unwrapWETHMethodEncoded = EthLikeWeb3Pure.encodeFunctionCall(
      this.swapRouterContract.abi,
      this.unwrapWethMethodName,
      [amountOutMin, receiverAddress]
    );

    return {
      methodName: 'multicall',
      methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
    };
  }

  protected getAmountOutMin(route: UniswapV3AlgebraRoute): string {
    return subtractPercent(route.outputAbsoluteAmount, this.settings.slippageTolerance).toFixed(0);
  }

  /**
   * Returns swap `exactInput` method's name and arguments to use in Swap contract.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param walletAddress Wallet address, making swap.
   * @param deadline Deadline of swap in seconds.
   */
  protected abstract getSwapRouterExactInputMethodParams(
    route: UniswapV3AlgebraRoute,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData;
}
