import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import {
  CcrSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { from, Observable, of } from 'rxjs';
import { filter, first, map, startWith, switchMap } from 'rxjs/operators';
import {
  crossChainSwapContractAddresses,
  SupportedCrossChainSwapBlockchain,
  supportedCrossChainSwapBlockchains
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import {
  TransitTokens,
  transitTokensWithMode
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { CrossChainRoutingTrade } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { crossChainSwapContractAbi } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import MaxGasPriceOverflowWarning from 'src/app/core/errors/models/common/MaxGasPriceOverflowWarning';
import CrossChainIsUnavailableWarning from 'src/app/core/errors/models/cross-chain-routing/CrossChainIsUnavailableWarning';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService {
  private contractAbi = crossChainSwapContractAbi;

  private contractAddresses: Record<SupportedCrossChainSwapBlockchain, string>;

  private transitTokens: TransitTokens;

  private uniswapV2Providers: Record<SupportedCrossChainSwapBlockchain, UniswapV2ProviderAbstract>;

  private toBlockchainsInContract: Record<SupportedCrossChainSwapBlockchain, number>;

  private settings: CcrSettingsForm;

  private currentCrossChainTrade: CrossChainRoutingTrade;

  public static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedCrossChainSwapBlockchain {
    return !!supportedCrossChainSwapBlockchains.find(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  private static checkBlockchains(
    fromBlockchain: BLOCKCHAIN_NAME,
    toBlockchain: BLOCKCHAIN_NAME
  ): void | never {
    if (
      !CrossChainRoutingService.isSupportedBlockchain(fromBlockchain) ||
      !CrossChainRoutingService.isSupportedBlockchain(toBlockchain)
    ) {
      throw Error('Not supported blockchains');
    }
  }

  constructor(
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly settingsService: SettingsService,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.setUniswapProviders();
    this.setToBlockchainsInContract();

    this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue))
      .subscribe(settings => {
        this.settings = settings;
      });

    this.contractAddresses = crossChainSwapContractAddresses.mainnet;
    this.transitTokens = transitTokensWithMode.mainnet;

    this.initTestingMode();
  }

  private initTestingMode(): void {
    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.contractAddresses = crossChainSwapContractAddresses.testnet;
        this.transitTokens = transitTokensWithMode.testnet;
      }
    });
  }

  private setUniswapProviders(): void {
    this.uniswapV2Providers = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.uniSwapV2Service,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.pancakeSwapService,
      [BLOCKCHAIN_NAME.POLYGON]: this.quickSwapService
    };
  }

  private setToBlockchainsInContract(): void {
    this.toBlockchainsInContract = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 2,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
      [BLOCKCHAIN_NAME.POLYGON]: 3
    };
  }

  public needApprove(): Observable<boolean> {
    const { fromToken } = this.swapFormService.inputValue;
    const web3Public: Web3Public = this.web3PublicService[fromToken.blockchain];
    if (Web3Public.isNativeAddress(fromToken.address)) {
      return of(false);
    }

    const contractAddress =
      this.contractAddresses[fromToken.blockchain as SupportedCrossChainSwapBlockchain];
    return from(
      web3Public.getAllowance(
        fromToken.address,
        this.providerConnectorService.address,
        contractAddress
      )
    ).pipe(map(allowance => allowance.eq(0)));
  }

  public approve(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    const { fromToken } = this.swapFormService.inputValue;
    const contractAddress =
      this.contractAddresses[fromToken.blockchain as SupportedCrossChainSwapBlockchain];
    return from(
      this.web3PrivateService.approveTokens(fromToken.address, contractAddress, 'infinity', options)
    );
  }

  private async getMinMaxTransitTokenAmounts(): Promise<{
    minAmount: BigNumber;
    maxAmount: BigNumber;
  }> {
    const { fromToken } = this.swapFormService.inputValue;
    const fromBlockchain = fromToken.blockchain;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromBlockchain)) {
      throw Error('Not supported blockchain');
    }

    const web3Public: Web3Public = this.web3PublicService[fromBlockchain];

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      const transitTokenAmountAbsolute = await web3Public.callContractMethod(
        this.contractAddresses[fromBlockchain],
        this.contractAbi,
        type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount'
      );

      const transitToken = this.transitTokens[fromBlockchain];
      return Web3Public.fromWei(transitTokenAmountAbsolute, transitToken.decimals);
    };

    return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
      ([minAmount, maxAmount]) => ({
        minAmount,
        maxAmount
      })
    );
  }

  private async getFromTokenAmount(
    fromToken: BlockchainToken,
    transitToken: BlockchainToken,
    transitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    if (fromToken.address.toLowerCase() === transitToken.address.toLowerCase()) {
      return transitTokenAmount;
    }

    const amountAbsolute = transitTokenAmount.gt(0)
      ? await this.uniswapV2Providers[
          fromToken.blockchain as SupportedCrossChainSwapBlockchain
        ].getFromAmount(fromToken.address, transitToken, transitTokenAmount)
      : 0;
    return Web3Public.fromWei(amountAbsolute, fromToken.decimals);
  }

  public async calculateTrade(): Promise<{
    toAmount: BigNumber;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromBlockchain = fromToken.blockchain as SupportedCrossChainSwapBlockchain;
    const toBlockchain = toToken.blockchain as SupportedCrossChainSwapBlockchain;
    CrossChainRoutingService.checkBlockchains(fromBlockchain, toBlockchain);

    const firstTransitToken = this.transitTokens[fromBlockchain] as BlockchainToken;
    const secondTransitToken = this.transitTokens[toBlockchain];

    const { path: firstPath, toAmount: firstTransitTokenAmount } = await this.getPathAndToAmount(
      fromBlockchain,
      fromToken,
      fromAmount,
      firstTransitToken
    );

    const feeAmountInPercents = await this.getFeeAmountInPercents();
    const secondTransitTokenAmount = firstTransitTokenAmount
      .multipliedBy(100 - feeAmountInPercents)
      .dividedBy(100);

    const { path: secondPath, toAmount } = await this.getPathAndToAmount(
      toBlockchain,
      secondTransitToken,
      secondTransitTokenAmount,
      toToken
    );

    const trade = {
      fromBlockchain,
      toBlockchain,
      tokenIn: fromToken,
      firstPath,
      tokenInAmount: fromAmount,
      firstTransitTokenAmount,
      rbcTokenOutAmountAbsolute: Web3Public.toWei(
        firstTransitTokenAmount,
        firstTransitToken.decimals
      ),
      secondTransitTokenAmount,
      tokenOut: toToken,
      secondPath,
      tokenOutAmount: toAmount
    };
    this.currentCrossChainTrade = trade;

    const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
      await this.getMinMaxTransitTokenAmounts();
    if (!firstTransitTokenAmount.gte(minTransitTokenAmount)) {
      const minAmount = await this.getFromTokenAmount(
        fromToken,
        firstTransitToken,
        minTransitTokenAmount
      );
      return {
        toAmount: trade.tokenOutAmount,
        minAmountError: minAmount
      };
    }
    if (!firstTransitTokenAmount.lte(maxTransitTokenAmount)) {
      const maxAmount = await this.getFromTokenAmount(
        fromToken,
        firstTransitToken,
        maxTransitTokenAmount
      );
      return {
        toAmount: trade.tokenOutAmount,
        maxAmountError: maxAmount
      };
    }

    return {
      toAmount: trade.tokenOutAmount
    };
  }

  private async getPathAndToAmount(
    blockchain: BLOCKCHAIN_NAME,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<{ path: string[]; toAmount: BigNumber }> {
    if (fromToken.address.toLowerCase() !== toToken.address.toLowerCase()) {
      const instantTrade = await this.uniswapV2Providers[
        blockchain as SupportedCrossChainSwapBlockchain
      ].calculateTrade(fromToken, fromAmount, toToken, false);
      return {
        path: instantTrade.path,
        toAmount: instantTrade.to.amount
      };
    }
    return { path: [fromToken.address], toAmount: fromAmount };
  }

  private async getFeeAmountInPercents(): Promise<number> {
    const fromBlockchain = this.swapFormService.inputValue
      .fromBlockchain as SupportedCrossChainSwapBlockchain;
    const contractAddress = this.contractAddresses[fromBlockchain];
    const web3PublicFromBlockchain: Web3Public = this.web3PublicService[fromBlockchain];
    const toBlockchainInContract = this.toBlockchainsInContract[fromBlockchain];
    const feeOfToBlockchainAbsolute = await web3PublicFromBlockchain.callContractMethod(
      contractAddress,
      this.contractAbi,
      'feeAmountOfBlockchain',
      {
        methodArguments: [toBlockchainInContract]
      }
    );
    return parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
  }

  public getFeeAmountData(): Observable<{
    percent: number;
    amount: BigNumber;
    amountInUsd: BigNumber;
  }> {
    if (!this.currentCrossChainTrade) {
      return of(null);
    }

    return this.tokensService.tokens.pipe(
      filter(tokens => !!tokens.size),
      first(),
      switchMap(async tokens => {
        const percent = await this.getFeeAmountInPercents();
        const amount = this.currentCrossChainTrade.firstTransitTokenAmount.multipliedBy(
          percent / 100
        );

        const fromBlockchain = this.currentCrossChainTrade
          .fromBlockchain as SupportedCrossChainSwapBlockchain;
        const transitToken = this.transitTokens[fromBlockchain];
        const foundTransitToken = tokens.find(
          token =>
            token.blockchain === fromBlockchain &&
            token.address.toLowerCase() === transitToken.address.toLowerCase()
        );
        const amountInUsd = foundTransitToken?.price
          ? amount.multipliedBy(foundTransitToken.price)
          : null;

        return {
          percent,
          amount,
          amountInUsd
        };
      })
    );
  }

  private async checkGasPrice(toBlockchain: BLOCKCHAIN_NAME): Promise<void | never> {
    const contractAddress =
      this.contractAddresses[toBlockchain as SupportedCrossChainSwapBlockchain];
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];
    const maxGasPrice = await web3Public.callContractMethod(
      contractAddress,
      this.contractAbi,
      'maxGasPrice'
    );
    const currentGasPrice = await web3Public.getGasPrice();
    if (new BigNumber(maxGasPrice).lt(currentGasPrice)) {
      throw new MaxGasPriceOverflowWarning(toBlockchain);
    }
  }

  private async checkPoolBalance(trade: CrossChainRoutingTrade): Promise<void | never> {
    const toBlockchain = trade.toBlockchain as SupportedCrossChainSwapBlockchain;
    const contractAddress = this.contractAddresses[toBlockchain];
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];

    const poolAddress = await web3Public.callContractMethod(
      contractAddress,
      this.contractAbi,
      'blockchainPool'
    );

    const secondTransitToken = this.transitTokens[toBlockchain];
    const poolBalanceAbsolute = await web3Public.getTokenBalance(
      poolAddress,
      secondTransitToken.address
    );
    const poolBalance = Web3Public.fromWei(poolBalanceAbsolute, secondTransitToken.decimals);

    if (trade.secondTransitTokenAmount.gt(poolBalance)) {
      throw new CrossChainIsUnavailableWarning();
    }
  }

  public createTrade(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    return from(
      (async () => {
        const trade = this.currentCrossChainTrade;

        this.providerConnectorService.checkSettings(trade.fromBlockchain);
        await this.checkWorking(trade);
        await this.checkGasPrice(trade.toBlockchain);
        await this.checkPoolBalance(trade);

        const web3PublicFromBlockchain: Web3Public = this.web3PublicService[trade.fromBlockchain];
        const walletAddress = this.providerConnectorService.address;

        const slippageTolerance = this.settings.slippageTolerance / 100;
        const tokenInAmountMax = trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
        await web3PublicFromBlockchain.checkBalance(trade.tokenIn, tokenInAmountMax, walletAddress);

        const contractAddress =
          this.contractAddresses[trade.fromBlockchain as SupportedCrossChainSwapBlockchain];
        const toBlockchainInContract =
          this.toBlockchainsInContract[trade.toBlockchain as SupportedCrossChainSwapBlockchain];

        const blockchainCryptoFee = await web3PublicFromBlockchain.callContractMethod(
          contractAddress,
          this.contractAbi,
          'blockchainCryptoFee',
          {
            methodArguments: [toBlockchainInContract]
          }
        );

        const isFromTokenNative = Web3Public.isNativeAddress(trade.tokenIn.address);
        const methodName = isFromTokenNative
          ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
          : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

        const tokenInAmountAbsolute = Web3Public.toWei(tokenInAmountMax, trade.tokenIn.decimals);
        const tokenOutMinAbsolute = Web3Public.toWei(
          trade.tokenOutAmount.multipliedBy(1 - slippageTolerance),
          trade.tokenOut.decimals
        );
        const methodArguments = [
          [
            toBlockchainInContract,
            tokenInAmountAbsolute,
            trade.firstPath,
            trade.secondPath,
            trade.rbcTokenOutAmountAbsolute,
            tokenOutMinAbsolute,
            walletAddress,
            Web3Public.isNativeAddress(trade.tokenOut.address)
          ]
        ];

        const value = new BigNumber(blockchainCryptoFee)
          .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
          .toFixed(0);

        const receipt = await this.web3PrivateService.tryExecuteContractMethod(
          contractAddress,
          this.contractAbi,
          methodName,
          methodArguments,
          {
            ...options,
            value
          },
          err => {
            const includesErrCode = err.message.includes('-32000');
            const includesPhrase = err.message.includes('insufficient funds for transfer');
            return includesErrCode && includesPhrase;
          }
        );
        this.crossChainRoutingApiService.postTradeInWidget(
          receipt.transactionHash,
          trade.fromBlockchain
        );
        return receipt;
      })()
    );
  }

  /**
   * @description Check if contract is alive for now.
   * @param trade Cross chain trade.
   */
  private async checkWorking(trade: CrossChainRoutingTrade): Promise<void> {
    const { fromBlockchain, toBlockchain } = trade;

    const fromContractAddress = this.contractAddresses[
      fromBlockchain as SupportedCrossChainSwapBlockchain
    ] as string;
    const toContractAddress = this.contractAddresses[
      toBlockchain as SupportedCrossChainSwapBlockchain
    ] as string;
    const fromWeb3Public: Web3Public = this.web3PublicService[fromBlockchain];
    const toWeb3Public: Web3Public = this.web3PublicService[toBlockchain];

    const sourceContractPaused = await fromWeb3Public.callContractMethod(
      fromContractAddress,
      this.contractAbi,
      'paused'
    );

    const targetContractPaused = await toWeb3Public.callContractMethod(
      toContractAddress,
      this.contractAbi,
      'paused'
    );

    if (sourceContractPaused || targetContractPaused) {
      throw new CrossChainIsUnavailableWarning();
    }
  }
}
