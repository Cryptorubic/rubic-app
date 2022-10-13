import { Injectable } from '@angular/core';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { firstValueFrom, interval, Subscription, switchMap, timer } from 'rxjs';
import BigNumber from 'bignumber.js';
import { InstantTradesApiService } from '@core/services/backend/instant-trades-api/instant-trades-api.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { IframeService } from '@core/services/iframe/iframe.service';
import { EthWethSwapProviderService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/eth-weth-swap-provider.service';
import { TradeCalculationService } from '@features/swaps/core/services/trade-calculation-service/trade-calculation.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CHAIN_TYPE,
  EvmBlockchainName,
  Injector,
  SwapTransactionOptions,
  Token,
  OnChainTradeType,
  UnnecessaryApproveError,
  Web3Public,
  Web3Pure,
  OnChainTrade,
  OnChainTradeError,
  TxStatus,
  EncodeTransactionOptions,
  BlockchainsInfo
} from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import {
  IT_PROXY_FEE_CONTRACT_ABI,
  IT_PROXY_FEE_CONTRACT_ADDRESS,
  IT_PROXY_FEE_CONTRACT_METHOD
} from '@features/swaps/features/instant-trade/services/instant-trade-service/constants/iframe-proxy-fee-contract';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-options';
import { shouldCalculateGas } from '@features/swaps/features/instant-trade/services/instant-trade-service/constants/should-calculate-gas';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { TradeParser } from '@features/swaps/features/instant-trade/services/instant-trade-service/utils/trade-parser';
import { ENVIRONMENT } from 'src/environments/environment';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { TransactionConfig } from 'web3-core';
import { filter } from 'rxjs/operators';
import { TransactionFailed } from '@core/errors/models/common/transaction-failed';

@Injectable()
export class InstantTradeService extends TradeCalculationService {
  private static readonly unsupportedItNetworks: BlockchainName[] = [];

  public static isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return !InstantTradeService.unsupportedItNetworks.includes(blockchain);
  }

  private get receiverAddress(): string | null {
    if (!this.settingsService.instantTradeValue.showReceiverAddress) {
      return null;
    }
    return this.targetNetworkAddressService.address;
  }

  constructor(
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly ethWethSwapProvider: EthWethSwapProviderService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly sdk: RubicSdkService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly gasService: GasService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    super('instant-trade');
  }

  public async needApprove(trade: OnChainTrade): Promise<boolean> {
    if (this.iframeService.isIframeWithFee(trade.from.blockchain, trade.type)) {
      const chainType = BlockchainsInfo.getChainType(trade.from.blockchain);
      if (Web3Pure[chainType].isNativeAddress(trade.from.address)) {
        return false;
      }

      const allowance = await Injector.web3PublicService
        .getWeb3Public(trade.from.blockchain as EvmBlockchainName)
        .getAllowance(
          trade.from.address,
          this.authService.userAddress,
          IT_PROXY_FEE_CONTRACT_ADDRESS
        );
      return new BigNumber(allowance).lt(trade.from.weiAmount);
    }
    return trade.needApprove();
  }

  public async approve(trade: OnChainTrade): Promise<void> {
    this.checkDeviceAndShowNotification();
    let subscription$: Subscription;
    const { blockchain } = TradeParser.getItSwapParams(trade);
    const useRubicGasPrice = shouldCalculateGas[blockchain];

    const transactionOptions = {
      onTransactionHash: () => {
        subscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(useRubicGasPrice && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      })
    };

    try {
      if (this.iframeService.isIframeWithFee(trade.from.blockchain, trade.type)) {
        await Injector.web3PrivateService
          .getWeb3Private(CHAIN_TYPE.EVM)
          .approveTokens(
            trade.from.address,
            IT_PROXY_FEE_CONTRACT_ADDRESS,
            'infinity',
            transactionOptions
          );
      } else {
        await trade.approve(transactionOptions);
      }

      this.notificationsService.showApproveSuccessful();
    } catch (err) {
      if (err instanceof UnnecessaryApproveError) {
        return;
      }
      throw err;
    } finally {
      subscription$?.unsubscribe();
    }
  }

  public getEthWethTrade(): WrapTrade | null {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    if (
      !fromToken ||
      !toToken ||
      !this.ethWethSwapProvider.isEthAndWethSwap(fromBlockchain, fromToken.address, toToken.address)
    ) {
      return null;
    }

    return {
      blockchain: fromBlockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: fromAmount
      }
    };
  }

  public async calculateTrades(
    fromToken: {
      address: string;
      blockchain: BlockchainName;
    },
    fromAmount: string,
    toToken: {
      address: string;
      blockchain: BlockchainName;
    }
  ): Promise<Array<OnChainTrade | OnChainTradeError>> {
    return this.sdk.instantTrade.calculateTrade(
      fromToken as Token<EvmBlockchainName>,
      fromAmount,
      toToken.address,
      {
        timeout: 10000,
        slippageTolerance: this.settingsService.instantTradeValue.slippageTolerance / 100,
        gasCalculation: shouldCalculateGas[fromToken.blockchain] ? 'calculate' : 'disabled',
        zrxAffiliateAddress: ENVIRONMENT.zrxAffiliateAddress
      }
    );
  }

  public async createTrade(
    providerName: OnChainTradeType,
    trade: OnChainTrade | WrapTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    this.checkDeviceAndShowNotification();
    const { fromSymbol, toSymbol, fromAmount, fromPrice, blockchain, fromAddress, fromDecimals } =
      TradeParser.getItSwapParams(trade);

    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    await blockchainAdapter.checkBalance(
      { address: fromAddress, decimals: fromDecimals, symbol: fromSymbol } as Token,
      fromAmount,
      this.authService.userAddress
    );

    let transactionHash: string;
    let subscription$: Subscription;

    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];

    const receiverAddress = this.receiverAddress;
    const options: SwapTransactionOptions = {
      onConfirm: (hash: string) => {
        transactionHash = hash;
        confirmCallback?.();

        this.notifyGtmAfterSignTx(
          transactionHash,
          fromSymbol,
          toSymbol,
          fromAmount.multipliedBy(fromPrice)
        );
        this.gtmService.checkGtm();

        subscription$ = this.notifyTradeInProgress(hash, blockchain);

        this.postTrade(hash, providerName, trade);
      },
      ...(shouldCalculateGasPrice && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      }),
      ...(receiverAddress && { receiverAddress })
    };

    try {
      const userAddress = this.authService.userAddress;
      if (trade instanceof OnChainTrade) {
        await this.checkFeeAndCreateTrade(providerName, trade, options);
      } else {
        await this.ethWethSwapProvider.createTrade(trade, options);
      }

      if (trade instanceof OnChainTrade && trade.from.blockchain === BLOCKCHAIN_NAME.TRON) {
        const txStatusData = await firstValueFrom(
          interval(7_000).pipe(
            switchMap(() => this.sdk.onChainStatusManager.getBridgersSwapStatus(transactionHash)),
            filter(
              statusData =>
                statusData.status === TxStatus.SUCCESS || statusData.status === TxStatus.FAIL
            )
          )
        );
        subscription$.unsubscribe();
        if (txStatusData.status === TxStatus.SUCCESS) {
          this.showSuccessTrxNotification();
        } else {
          throw new TransactionFailed(BLOCKCHAIN_NAME.TRON, txStatusData.hash);
        }
      } else {
        subscription$.unsubscribe();
        this.showSuccessTrxNotification();
      }

      await this.instantTradesApiService
        .notifyInstantTradesBot({
          provider: providerName,
          blockchain,
          walletAddress: userAddress,
          trade,
          txHash: transactionHash
        })
        .catch(_err => {});

      this.updateTrade(transactionHash, true);
    } catch (err) {
      subscription$?.unsubscribe();

      if (transactionHash && !this.isNotMinedError(err)) {
        this.updateTrade(transactionHash, false);
      }

      throw err;
    }
  }

  private async checkFeeAndCreateTrade(
    providerName: OnChainTradeType,
    trade: OnChainTrade,
    options: SwapTransactionOptions
  ): Promise<string> {
    if (this.iframeService.isIframeWithFee(trade.from.blockchain, providerName)) {
      return this.createTradeWithFee(trade, options);
    }

    return trade.swap(options);
  }

  private async createTradeWithFee(trade: OnChainTrade, options: ItOptions): Promise<string> {
    await Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .checkBlockchainCorrect(trade.from.blockchain);

    const fullOptions: EncodeTransactionOptions = {
      ...options,
      fromAddress: IT_PROXY_FEE_CONTRACT_ADDRESS,
      supportFee: false
    };
    const transactionOptions = (await trade.encode(fullOptions)) as TransactionConfig;
    const { feeData } = this.iframeService;
    const fee = feeData.fee * 1000;

    const promoterAddress = await firstValueFrom(this.iframeService.getPromoterAddress());

    const methodName = promoterAddress
      ? IT_PROXY_FEE_CONTRACT_METHOD.SWAP_WITH_PROMOTER
      : IT_PROXY_FEE_CONTRACT_METHOD.SWAP;

    const methodArguments = [
      trade.from.address,
      trade.to.address,
      Web3Pure.toWei(trade.from.tokenAmount, trade.from.decimals),
      transactionOptions.to,
      transactionOptions.data,
      [fee, feeData.feeTarget]
    ];
    if (promoterAddress) {
      methodArguments.push(promoterAddress);
    }
    const receipt = await Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .tryExecuteContractMethod(
        IT_PROXY_FEE_CONTRACT_ADDRESS,
        IT_PROXY_FEE_CONTRACT_ABI,
        methodName,
        methodArguments,
        {
          ...transactionOptions,
          onTransactionHash: options?.onConfirm,
          gas: undefined
        } as TransactionOptions
      );
    return receipt.transactionHash;
  }

  private async postTrade(
    transactionHash: string,
    providerName: OnChainTradeType,
    trade: OnChainTrade | WrapTrade
  ): Promise<void> {
    let fee: number;
    let promoCode: string;
    const { blockchain } = TradeParser.getItSwapParams(trade);
    if (this.iframeService.isIframeWithFee(blockchain, providerName)) {
      fee = this.iframeService.feeData.fee;
      promoCode = this.iframeService.promoCode;
    }

    // Boba is too fast, status does not have time to get into the database.
    const waitTime = blockchain === BLOCKCHAIN_NAME.BOBA ? 3_000 : 0;
    await timer(waitTime)
      .pipe(
        switchMap(() =>
          this.instantTradesApiService.createTrade(
            transactionHash,
            providerName,
            trade,
            fee,
            promoCode
          )
        )
      )
      .toPromise();
  }

  /**
   * Checks if error is that transaction was not yet mined.
   * @param err Error thrown during creating transaction.
   */
  private isNotMinedError(err: Error): boolean {
    return (
      Boolean(err?.message?.includes) &&
      err.message.includes(
        'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
      )
    );
  }

  /**
   * Calls api service method to update transaction's status.
   * @param hash Transaction's hash.
   * @param success If true status is `completed`, otherwise `cancelled`.
   */
  private updateTrade(hash: string, success: boolean): Subscription {
    return this.instantTradesApiService.patchTrade(hash, success).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  private notifyGtmAfterSignTx(
    transactionHash: string,
    fromToken: string,
    toToken: string,
    price: BigNumber
  ): void {
    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      transactionHash,
      fromToken,
      toToken,
      new BigNumber(0),
      price
    );
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }
}
