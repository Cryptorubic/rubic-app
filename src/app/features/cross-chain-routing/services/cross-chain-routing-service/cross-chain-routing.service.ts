import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { from, Observable } from 'rxjs';
import { crossChainSwapContractAddresses } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { CrossChainRoutingTrade } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import MaxGasPriceOverflowWarning from 'src/app/core/errors/models/common/MaxGasPriceOverflowWarning';
import CrossChainIsUnavailableWarning from 'src/app/core/errors/models/cross-chain-routing/CrossChainIsUnavailableWarning';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { AbiItem } from 'web3-utils';
import {
  SupportedCrossChainSwapBlockchain,
  supportedCrossChainSwapBlockchains
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import {
  TransitTokens,
  transitTokensWithMode
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/transit-tokens';
import { crossChainSwapContractAbi } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { PangolinAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import InsufficientFundsGasPriceValueError from 'src/app/core/errors/models/cross-chain-routing/insufficient-funds-gas-price-value';
import FailedToCheckForTransactionReceiptError from 'src/app/core/errors/models/common/FailedToCheckForTransactionReceiptError';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { JoeAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import { SolarBeamMoonRiverService } from '@features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver.service';
import { CrossChainTradeInfo } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainTradeInfo';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { PCacheable } from 'ts-cacheable';
import { SpookySwapFantomService } from '@features/instant-trade/services/instant-trade-service/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.service';
import { RaydiumService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/raydium.service';
import { CrossChainContractReader } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-reader/cross-chain-contract-reader';
import { CrossChainContractExecutorFacade } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/cross-chain-contract-executor.facade';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { SolanaContractExecutor } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor';
import CustomError from '@core/errors/models/custom-error';
import { CrossChainContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/contract-data';

interface PathAndToAmount {
  path: string[];
  toAmount: BigNumber;
}

interface IndexedPathAndToAmount {
  contractIndex: number;
  pathAndToAmount: PathAndToAmount;
}

const CACHEABLE_MAX_AGE = 15_000;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService {
  public static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedCrossChainSwapBlockchain {
    return !!supportedCrossChainSwapBlockchains.find(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  private readonly contractAbi: AbiItem[];

  private readonly contractAddresses: Record<SupportedCrossChainSwapBlockchain, string[]>;

  private readonly transitTokens: TransitTokens;

  private contractsData: Record<SupportedCrossChainSwapBlockchain, CrossChainContractData[]>;

  private currentCrossChainTrade: CrossChainRoutingTrade;

  /**
   * Gets slippage, selected in settings, divided by 100%.
   */
  private get slippageTolerance(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  constructor(
    // Providers start.
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly joeAvalancheService: JoeAvalancheService,
    private readonly solarBeamMoonRiverService: SolarBeamMoonRiverService,
    private readonly spookySwapFantomService: SpookySwapFantomService,
    private readonly raydiumService: RaydiumService,
    // Providers end.
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly iframeService: IframeService,
    private readonly gasService: GasService,
    private readonly ccrContractExecutorFacade: CrossChainContractExecutorFacade,
    private readonly solanaPrivateAdapter: SolanaWeb3PrivateService
  ) {
    this.contractAbi = crossChainSwapContractAbi;

    this.setContractsData();
    this.contractAddresses = crossChainSwapContractAddresses;
    this.transitTokens = transitTokensWithMode;
  }

  private setContractsData(): void {
    this.contractsData = {
      [BLOCKCHAIN_NAME.ETHEREUM]: [new CrossChainContractData(this.uniSwapV2Service, 2)],
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
        new CrossChainContractData(this.pancakeSwapService, 1)
      ],
      [BLOCKCHAIN_NAME.POLYGON]: [new CrossChainContractData(this.quickSwapService, 3)],
      [BLOCKCHAIN_NAME.AVALANCHE]: [
        new CrossChainContractData(this.pangolinAvalancheService, 4, true),
        new CrossChainContractData(this.joeAvalancheService, 5, true)
      ],
      [BLOCKCHAIN_NAME.MOONRIVER]: [new CrossChainContractData(this.solarBeamMoonRiverService, 6)],
      [BLOCKCHAIN_NAME.FANTOM]: [new CrossChainContractData(this.spookySwapFantomService, 7)],
      [BLOCKCHAIN_NAME.SOLANA]: [new CrossChainContractData(this.raydiumService, 8)]
    };
  }

  private async needApprove(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    contractIndex: number,
    fromToken: BlockchainToken
  ): Promise<boolean> {
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    if (blockchainAdapter.isNativeAddress(fromToken.address)) {
      return false;
    }

    const contractAddress = this.contractAddresses[fromBlockchain][contractIndex];
    return blockchainAdapter
      .getAllowance({
        tokenAddress: fromToken.address,
        ownerAddress: this.authService.userAddress,
        spenderAddress: contractAddress
      })
      .then(allowance => allowance.eq(0));
  }

  public approve(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    const { fromBlockchain, tokenIn: fromToken, fromContractIndex } = this.currentCrossChainTrade;
    const contractAddress = this.contractAddresses[fromBlockchain][fromContractIndex];
    return from(
      this.web3PrivateService.approveTokens(fromToken.address, contractAddress, 'infinity', options)
    );
  }

  public async calculateTrade(calculateNeedApprove = false): Promise<{
    toAmount: BigNumber;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
    needApprove?: boolean;
  }> {
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromBlockchain = fromToken.blockchain;
    const toBlockchain = toToken.blockchain;
    if (
      !CrossChainRoutingService.isSupportedBlockchain(fromBlockchain) ||
      !CrossChainRoutingService.isSupportedBlockchain(toBlockchain)
    ) {
      throw Error('Not supported blockchains');
    }

    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];

    const fromSlippage = 1 - this.slippageTolerance / 2;
    const toSlippage = 1 - this.slippageTolerance / 2;

    const {
      contractIndex: fromContractIndex,
      pathAndToAmount: { path: firstPath, toAmount: firstTransitTokenAmount }
    } = await this.getBestContractIndex(fromBlockchain, fromToken, fromAmount, firstTransitToken);

    const { secondTransitTokenAmount, feeInPercents } = await this.getSecondTransitTokenAmount(
      toBlockchain,
      firstTransitTokenAmount,
      firstPath.length === 1,
      fromSlippage
    );

    const {
      contractIndex: toContractIndex,
      pathAndToAmount: { path: secondPath, toAmount }
    } = await this.getBestContractIndex(
      toBlockchain,
      secondTransitToken,
      secondTransitTokenAmount,
      toToken
    );

    const cryptoFee = await this.getCryptoFee(fromBlockchain, toBlockchain);

    this.currentCrossChainTrade = {
      fromBlockchain,
      fromContractIndex,
      tokenIn: fromToken,
      tokenInAmount: fromAmount,
      firstTransitTokenAmount,
      firstPath,
      fromSlippage,

      toBlockchain,
      toContractIndex,
      secondTransitTokenAmount,
      tokenOut: toToken,
      tokenOutAmount: toAmount,
      secondPath,
      toSlippage,

      transitTokenFee: feeInPercents,
      cryptoFee
    };

    const [gasData, minMaxErrors, needApprove] = await Promise.all([
      this.getGasData(this.currentCrossChainTrade),
      this.checkMinMaxErrors(this.currentCrossChainTrade),
      calculateNeedApprove
        ? this.needApprove(fromBlockchain, fromContractIndex, fromToken)
        : undefined
    ]);
    this.currentCrossChainTrade = {
      ...this.currentCrossChainTrade,
      ...gasData
    };

    return {
      toAmount,
      ...minMaxErrors,
      needApprove
    };
  }

  /**
   * Gets best contract index in blockchain, based on profit of uniswap provider.
   */
  private async getBestContractIndex(
    blockchain: SupportedCrossChainSwapBlockchain,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<IndexedPathAndToAmount> {
    const promises = this.contractAddresses[blockchain].map(async (_, contractIndex) => ({
      contractIndex,
      pathAndToAmount: await this.getPathAndToAmount(
        blockchain,
        contractIndex,
        fromToken,
        fromAmount,
        toToken
      )
    }));

    return Promise.allSettled(promises).then(results => {
      const sortedResults = results
        .filter(result => result.status === 'fulfilled')
        .map((result: PromiseFulfilledResult<IndexedPathAndToAmount>) => result.value)
        .sort((a, b) => b.pathAndToAmount.toAmount.comparedTo(a.pathAndToAmount.toAmount));

      if (!sortedResults.length) {
        throw (results[0] as PromiseRejectedResult).reason;
      }
      return sortedResults[0];
    });
  }

  /**
   * Calculates uniswap course of {@param fromToken } to {@param toToken} and returns output amount of {@param toToken}.
   * @param blockchain Tokens' blockchain.
   * @param contractIndex Index of contract to use.
   * @param fromToken From token.
   * @param fromAmount Input amount of from token.
   * @param toToken To token.
   */
  private async getPathAndToAmount(
    blockchain: SupportedCrossChainSwapBlockchain,
    contractIndex: number,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<PathAndToAmount> {
    if (!compareAddresses(fromToken.address, toToken.address)) {
      try {
        const instantTrade = await this.contractsData[blockchain][
          contractIndex
        ].provider.calculateTrade(fromToken, fromAmount, toToken, false);
        return {
          path: instantTrade.path.map(token => token.address),
          toAmount: instantTrade.to.amount
        };
      } catch (err) {
        if (err instanceof InsufficientLiquidityError) {
          throw new InsufficientLiquidityError('CrossChainRouting');
        }
        throw err;
      }
    }
    return {
      path: [fromToken.address],
      toAmount: fromAmount
    };
  }

  /**
   * Compares min and max amounts, permitted in source contract, with current trade's value.
   */
  private async checkMinMaxErrors(trade: CrossChainRoutingTrade): Promise<{
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    const { fromBlockchain, firstTransitTokenAmount, fromSlippage } = trade;
    const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
      await this.getMinMaxTransitTokenAmounts(fromBlockchain, fromSlippage);

    if (firstTransitTokenAmount.lt(minTransitTokenAmount)) {
      const minAmount = await this.getFromTokenAmount(
        fromBlockchain,
        trade.fromContractIndex,
        trade.tokenIn,
        minTransitTokenAmount
      );
      if (!minAmount?.isFinite()) {
        throw new InsufficientLiquidityError('CrossChainRouting');
      }
      return {
        minAmountError: minAmount
      };
    }

    if (firstTransitTokenAmount.gt(maxTransitTokenAmount)) {
      const maxAmount = await this.getFromTokenAmount(
        fromBlockchain,
        trade.fromContractIndex,
        trade.tokenIn,
        maxTransitTokenAmount
      );
      return {
        maxAmountError: maxAmount
      };
    }

    return {};
  }

  /**
   * Gets min and max permitted amounts of transit token in source and target blockchain.
   * @param fromBlockchain Source blockchain.
   * @param fromSlippage Slippage in source blockchain.
   */
  private async getMinMaxTransitTokenAmounts(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    fromSlippage: number
  ): Promise<{
    minAmount: BigNumber;
    maxAmount: BigNumber;
  }> {
    const firstTransitToken = this.transitTokens[fromBlockchain];

    // min/max amounts are equal in all contracts
    const fromContractAddress = this.contractAddresses[fromBlockchain][0];

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
      const contractFacade = new CrossChainContractReader(blockchainAdapter);
      const firstTransitTokenAmountAbsolute =
        type === 'minAmount'
          ? await contractFacade.minTokenAmount(fromContractAddress)
          : await contractFacade.maxTokenAmount(fromContractAddress);
      const firstTransitTokenAmount = EthLikeWeb3Public.fromWei(
        firstTransitTokenAmountAbsolute,
        firstTransitToken.decimals
      );

      if (type === 'minAmount') {
        return firstTransitTokenAmount.dividedBy(fromSlippage);
      }
      return firstTransitTokenAmount.minus(1);
    };

    return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
      ([minAmount, maxAmount]) => ({
        minAmount,
        maxAmount
      })
    );
  }

  /**
   * Calculates uniswap course of transit token to {@param fromToken} and returns input amount of {@param fromToken}.
   * @param blockchain Blockchain to make swap in.
   * @param contractIndex Index of contract to use.
   * @param fromToken From token.
   * @param transitTokenAmount Output amount of transit token.
   */
  private async getFromTokenAmount(
    blockchain: SupportedCrossChainSwapBlockchain,
    contractIndex: number,
    fromToken: BlockchainToken,
    transitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    const transitToken = this.transitTokens[blockchain];
    if (compareAddresses(fromToken.address, transitToken.address)) {
      return transitTokenAmount;
    }

    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const amountAbsolute = transitTokenAmount.gt(0)
      ? await this.contractsData[fromToken.blockchain][contractIndex].provider.getFromAmount(
          fromToken,
          transitToken,
          transitTokenAmount
        )
      : 0;
    return EthLikeWeb3Public.fromWei(amountAbsolute, fromToken.decimals);
  }

  /**
   * Calculates transit token's amount in target blockchain, based on transit token's amount is source blockchain.
   * @param toBlockchain Target blockchain
   * @param firstTransitTokenAmount Amount of transit token in source blockchain.
   * @param isDirectTrade True, if first transit token is traded directrly.
   * @param fromSlippage Slippage in source blockchain.
   */
  private async getSecondTransitTokenAmount(
    toBlockchain: SupportedCrossChainSwapBlockchain,
    firstTransitTokenAmount: BigNumber,
    isDirectTrade: boolean,
    fromSlippage: number
  ): Promise<{ secondTransitTokenAmount: BigNumber; feeInPercents: number }> {
    const feeInPercents = await this.getFeeInPercents(toBlockchain);
    let secondTransitTokenAmount = firstTransitTokenAmount
      .multipliedBy(100 - feeInPercents)
      .dividedBy(100);

    if (!isDirectTrade) {
      secondTransitTokenAmount = secondTransitTokenAmount.multipliedBy(fromSlippage);
    }

    return {
      secondTransitTokenAmount,
      feeInPercents
    };
  }

  /**
   * Gets fee amount of transit token in percents in target blockchain.
   * @param toBlockchain Target blockchain.
   */
  private async getFeeInPercents(toBlockchain: SupportedCrossChainSwapBlockchain): Promise<number> {
    // fee is equal in all contracts
    const contractAddress = this.contractAddresses[toBlockchain][0];
    const numOfBlockchainInContract = this.contractsData[toBlockchain][0].contractNumber;

    const blockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];
    const feeOfToBlockchainAbsolute = await new CrossChainContractReader(
      blockchainAdapter
    ).feeAmountOfBlockchain(contractAddress, numOfBlockchainInContract);
    return parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
  }

  /**
   * Gets fee amount in crypto in source blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @return Promise<number> Crypto fee in Wei.
   */
  private async getCryptoFee(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    toBlockchain: SupportedCrossChainSwapBlockchain
  ): Promise<number> {
    // crypto fee is equal in all contracts
    const toBlockchainInContract = this.contractsData[toBlockchain][0].contractNumber;
    const contractAddress = this.contractAddresses[fromBlockchain][0];
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    return new CrossChainContractReader(blockchainAdapter).blockchainCryptoFee(
      contractAddress,
      toBlockchainInContract
    );
  }

  /**
   * Calculates gas limit and gas price in source network, if possible to calculate.
   */
  private async getGasData(trade: CrossChainRoutingTrade): Promise<{
    gasLimit: BigNumber;
    gasPrice: string;
  }> {
    const { fromBlockchain } = trade;
    const walletAddress = this.authService.userAddress;
    if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
      return null;
    }

    try {
      const { contractAddress, methodName, methodArguments, value } =
        await this.ccrContractExecutorFacade.getContractData(
          trade,
          walletAddress,
          this.contractsData[this.currentCrossChainTrade.toBlockchain][
            this.currentCrossChainTrade.fromContractIndex
          ].contractNumber
        );

      const web3Public = this.publicBlockchainAdapterService[fromBlockchain];
      const gasLimit = await web3Public.getEstimatedGas(
        this.contractAbi,
        contractAddress,
        methodName,
        methodArguments,
        walletAddress,
        value
      );
      const gasPrice = EthLikeWeb3Public.toWei(
        await this.gasService.getGasPriceInEthUnits(fromBlockchain)
      );

      return {
        gasLimit,
        gasPrice
      };
    } catch (_err) {
      return null;
    }
  }

  /**
   * Gets trade info to show in transaction info panel.
   */
  public async getTradeInfo(): Promise<CrossChainTradeInfo> {
    if (!this.currentCrossChainTrade) {
      return null;
    }

    const trade = this.currentCrossChainTrade;
    const {
      fromBlockchain,
      toBlockchain,
      tokenIn,
      tokenOut,
      tokenInAmount,
      tokenOutAmount,
      firstTransitTokenAmount,
      secondTransitTokenAmount
    } = trade;
    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];

    const feePercent = trade.transitTokenFee;
    const fee = feePercent / 100;
    const feeAmount = trade.secondTransitTokenAmount.multipliedBy(fee).dividedBy(1 - fee);

    const estimatedGas = trade.gasLimit?.multipliedBy(EthLikeWeb3Public.fromWei(trade.gasPrice));

    const [priceImpactFrom, priceImpactTo] = await Promise.all([
      this.calculatePriceImpact(
        tokenIn,
        firstTransitToken,
        tokenInAmount,
        firstTransitTokenAmount,
        'from'
      ),
      this.calculatePriceImpact(
        tokenOut,
        secondTransitToken,
        tokenOutAmount,
        secondTransitTokenAmount,
        'to'
      )
    ]);

    return {
      feePercent,
      feeAmount,
      feeTokenSymbol: secondTransitToken.symbol,
      cryptoFee: trade.cryptoFee,
      estimatedGas,
      priceImpactFrom,
      priceImpactTo
    };
  }

  /**
   * Calculates price impact of token to 'transit token', or vice versa, trade.
   * @param token Token, selected in form.
   * @param transitToken Transit token.
   * @param tokenAmount Amount of token, selected in form.
   * @param transitTokenAmount Amount of transit token.
   * @param type 'From' or 'to' type of token in form.
   * @return number Price impact in percents.
   */
  private async calculatePriceImpact(
    token: TokenAmount,
    transitToken: InstantTradeToken,
    tokenAmount: BigNumber,
    transitTokenAmount: BigNumber,
    type: 'from' | 'to'
  ): Promise<number> {
    if (!compareAddresses(token.address, transitToken.address)) {
      const transitTokenPrice = await this.tokensService.getAndUpdateTokenPrice({
        address: transitToken.address,
        blockchain: token.blockchain
      });
      const priceImpactArguments: [number, number, BigNumber, BigNumber] =
        type === 'from'
          ? [token.price, transitTokenPrice, tokenAmount, transitTokenAmount]
          : [transitTokenPrice, token.price, transitTokenAmount, tokenAmount];
      return PriceImpactService.calculatePriceImpact(...priceImpactArguments);
    }
    return 0;
  }

  /**
   * Checks that contracts are alive.
   */
  private async checkWorking(): Promise<void> {
    const { fromBlockchain, toBlockchain, fromContractIndex, toContractIndex } =
      this.currentCrossChainTrade;

    const fromContractAddress = this.contractAddresses[fromBlockchain][fromContractIndex];
    const fromBlockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const isFromPaused = await new CrossChainContractReader(fromBlockchainAdapter).isPaused(
      fromContractAddress
    );
    if (isFromPaused) {
      throw new CrossChainIsUnavailableWarning();
    }

    const toContractAddress = this.contractAddresses[toBlockchain][toContractIndex];
    const toBlockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];
    const isToPaused = await new CrossChainContractReader(toBlockchainAdapter).isPaused(
      toContractAddress
    );
    if (isToPaused) {
      throw new CrossChainIsUnavailableWarning();
    }

    if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA || toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
      const isSolanaWorking = await SolanaContractExecutor.checkHealth(this.solanaPrivateAdapter);
      if (!isSolanaWorking) {
        throw new CustomError(
          'Solana blockchain mainnet is not stable right now. Please, try again later.'
        );
      }
    }
  }

  /**
   * Checks that in target blockchain current gas price is less than or equal to max gas price.
   */
  private async checkGasPrice(): Promise<void | never> {
    const { toBlockchain, toContractIndex } = this.currentCrossChainTrade;

    if (toBlockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
      return;
    }

    const contractAddress = this.contractAddresses[toBlockchain][toContractIndex];
    const blockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];

    const maxGasPrice = await blockchainAdapter.callContractMethod(
      contractAddress,
      this.contractAbi,
      'maxGasPrice'
    );
    const currentGasPrice = EthLikeWeb3Public.toWei(
      await this.gasService.getGasPriceInEthUnits(toBlockchain)
    );
    if (new BigNumber(maxGasPrice).lt(currentGasPrice)) {
      throw new MaxGasPriceOverflowWarning(toBlockchain);
    }
  }

  /**
   * Checks that in target blockchain tokens' pool's balance is enough.
   */
  @PCacheable({
    maxAge: CACHEABLE_MAX_AGE
  })
  private async checkContractBalance(): Promise<void | never> {
    const { toBlockchain, toContractIndex, secondTransitTokenAmount } = this.currentCrossChainTrade;
    const contractAddress = this.contractAddresses[toBlockchain][toContractIndex];
    const secondTransitToken = this.transitTokens[toBlockchain];
    const blockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];

    const contractBalanceAbsolute = await blockchainAdapter.getTokenBalance(
      contractAddress,
      secondTransitToken.address
    );
    const contractBalance = EthLikeWeb3Public.fromWei(
      contractBalanceAbsolute,
      secondTransitToken.decimals
    );

    if (secondTransitTokenAmount.gt(contractBalance)) {
      throw new CrossChainIsUnavailableWarning();
    }
  }

  /**
   * Checks contracts' state and user's balance.
   */
  private async checkTradeWorking(): Promise<void | never> {
    this.walletConnectorService.checkSettings(this.currentCrossChainTrade.fromBlockchain);

    await Promise.all([this.checkWorking(), this.checkGasPrice(), this.checkContractBalance()]);

    const { fromBlockchain, tokenIn, tokenInAmount } = this.currentCrossChainTrade;
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    await blockchainAdapter.checkBalance(tokenIn, tokenInAmount, this.authService.userAddress);
  }

  public createTrade(options: TransactionOptions = {}): Observable<void> {
    return from(
      (async () => {
        await this.checkTradeWorking();

        let transactionHash;
        try {
          transactionHash = await this.ccrContractExecutorFacade.executeCCRContract(
            this.currentCrossChainTrade,
            options,
            this.authService.userAddress,
            this.contractsData[this.currentCrossChainTrade.toBlockchain][
              this.currentCrossChainTrade.toContractIndex
            ].contractNumber
          );

          await this.postCrossChainTrade(transactionHash);
        } catch (err) {
          if (err instanceof FailedToCheckForTransactionReceiptError) {
            await this.postCrossChainTrade(transactionHash);
            return;
          }

          const errMessage = err.message || err.toString?.();
          if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
            throw new CrossChainIsUnavailableWarning();
          }
          if (errMessage?.includes('err: insufficient funds for gas * price + value')) {
            throw new InsufficientFundsGasPriceValueError(
              this.currentCrossChainTrade.tokenIn.symbol
            );
          }

          throw err;
        }
      })()
    );
  }

  /**
   * Posts trade data to log widget domain, or to apply promo code.
   * @param transactionHash Hash of checked transaction.
   */
  private async postCrossChainTrade(transactionHash: string): Promise<void> {
    const settings = this.settingsService.crossChainRoutingValue;
    await this.crossChainRoutingApiService.postTrade(
      transactionHash,
      this.currentCrossChainTrade.fromBlockchain,
      settings.promoCode?.status === 'accepted' ? settings.promoCode.text : undefined
    );
  }

  public calculateTokenOutAmountMin(): BigNumber {
    return CrossChainContractExecutorFacade.calculateTokenOutAmountMin(this.currentCrossChainTrade);
  }
}
