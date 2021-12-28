import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { from, Observable, of } from 'rxjs';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { startWith } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { TransactionReceipt } from 'web3-eth';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { subtractPercent } from 'src/app/shared/utils/utils';
import {
  UniV3AlgebraInstantTrade,
  UniV3AlgebraRoute
} from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/uni-v3-algebra-instant-trade';
import { NativeTokenAddress } from '@shared/constants/blockchain/native-token-address';
import { UniV3AlgebraConstants } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/models/uni-v3-algebra-constants';
import { ContractData } from '@shared/models/blockchain/contract-data';
import InstantTrade from '@features/instant-trade/models/Instant-trade';
import { MethodData } from '@shared/models/blockchain/method-data';
import { IsEthFromOrTo } from '@features/instant-trade/services/instant-trade-service/models/is-eth-from-or-to';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';

import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { EthLikeWeb3Pure } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

@Injectable()
export abstract class CommonUniV3AlgebraService implements ItProvider {
  protected readonly blockchain: BLOCKCHAIN_NAME;

  protected blockchainAdapter: EthLikeWeb3Public;

  private wethAddress: string;

  protected readonly swapRouterContract: ContractData;

  protected readonly isAlgebra: boolean;

  protected settings: ItSettingsForm;

  protected walletAddress: string;

  // Injected services
  private readonly publicBlockchainAdapterService = inject(PublicBlockchainAdapterService);

  private readonly web3PrivateService = inject(EthLikeWeb3PrivateService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly authService = inject(AuthService);

  private readonly settingsService = inject(SettingsService);

  protected readonly useTestingModeService = inject(UseTestingModeService);

  protected constructor(uniswapV3Constants: UniV3AlgebraConstants) {
    this.blockchain = uniswapV3Constants.blockchain;

    BlockchainsInfo.checkIsEthLike(this.blockchain);
    this.blockchainAdapter = this.publicBlockchainAdapterService[
      this.blockchain
    ] as EthLikeWeb3Public;

    this.wethAddress = uniswapV3Constants.wethAddressNetMode.mainnet;
    this.swapRouterContract = uniswapV3Constants.swapRouterContract;
    this.isAlgebra = uniswapV3Constants.isAlgebra;

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
        this.blockchainAdapter = this.publicBlockchainAdapterService[
          this.blockchain
        ] as EthLikeWeb3Public;
        this.wethAddress = uniswapV3Constants.wethAddressNetMode.testnet;
      }
    });
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    if (this.blockchainAdapter.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }

    return from(
      this.blockchainAdapter.getAllowance({
        tokenAddress,
        ownerAddress: this.walletAddress,
        spenderAddress: this.swapRouterContract.address
      })
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.walletConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      this.swapRouterContract.address,
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
    trade: UniV3AlgebraInstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
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
    trade: UniV3AlgebraInstantTrade,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const { methodName, methodArguments } = this.getSwapRouterMethodData(
      trade.route,
      fromAmountAbsolute,
      toTokenAddress,
      isEth,
      deadline
    );

    return this.web3PrivateService.tryExecuteContractMethod(
      this.swapRouterContract.address,
      this.swapRouterContract.abi,
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

  /**
   * Returns swap method's name and arguments to use in Swap contract.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param deadline Deadline of swap in seconds.
   */
  protected getSwapRouterMethodData(
    route: UniV3AlgebraRoute,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    deadline: number
  ): MethodData {
    if (!isEth.to) {
      return this.getSwapRouterExactInputMethodParams(
        route,
        fromAmountAbsolute,
        toTokenAddress,
        this.walletAddress,
        deadline
      );
    }

    const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
      this.getSwapRouterExactInputMethodParams(
        route,
        fromAmountAbsolute,
        toTokenAddress,
        NativeTokenAddress,
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
      !this.isAlgebra ? 'unwrapWETH9' : 'unwrapWNativeToken',
      [amountOutMin, this.walletAddress]
    );

    return {
      methodName: 'multicall',
      methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
    };
  }

  protected getAmountOutMin(route: UniV3AlgebraRoute): string {
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
    route: UniV3AlgebraRoute,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData;
}
