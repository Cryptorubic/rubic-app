import { Injectable } from '@angular/core';
import { ErrorCode, Symbiosis } from 'symbiosis-js-sdk';
import { SYMBIOSIS_CONFIG } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/constants/symbiosis-config';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Token as SymbiosisToken, TokenAmount as SymbiosisTokenAmount } from 'symbiosis-js-sdk';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import BigNumber from 'bignumber.js';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { TransactionRequest } from '@ethersproject/providers';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  EthLikeBlockchainName
} from '@shared/models/blockchain/blockchain-name';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { SYMBIOSIS_CONTRACT_ABI } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/constants/contract-abi';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { AuthService } from '@core/services/auth/auth.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { MethodData } from '@shared/models/blockchain/method-data';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import {
  SYMBIOSIS_CONTRACT_ADDRESS,
  SYMBIOSIS_SUPPORTED_BLOCKCHAINS,
  SymbiosisSupportedBlockchain
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/constants/contract-address';
import { compareAddresses } from '@shared/utils/utils';
import { OneInchEthService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/ethereum/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/bsc/one-inch-bsc-service/one-inch-bsc.service';
import { OneInchPolygonService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/polygon/one-inch-polygon-service/one-inch-polygon.service';
import { OneInchAvalancheService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/avalanche/one-inch-avalanche-service/one-inch-avalanche.service';
import { CommonOneinchService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/common-oneinch.service';
import { transitTokens } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/transit-tokens';
import { SymbiosisTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';

@Injectable()
export class SymbiosisService {
  public static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is SymbiosisSupportedBlockchain {
    return SYMBIOSIS_SUPPORTED_BLOCKCHAINS.some(supBlockchain => supBlockchain === blockchain);
  }

  private readonly symbiosis = new Symbiosis(SYMBIOSIS_CONFIG, 'rubic');

  private readonly DEFAULT_DEADLINE = 20;

  private readonly oneInchService: Record<SymbiosisSupportedBlockchain, CommonOneinchService> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: this.oneInchEthService,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.oneInchBscService,
    [BLOCKCHAIN_NAME.POLYGON]: this.oneInchPolygonService,
    [BLOCKCHAIN_NAME.AVALANCHE]: this.oneInchAvalancheService
  };

  private transactionRequest: TransactionRequest;

  private get walletAddress(): string {
    return this.authService.userAddress;
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly authService: AuthService,
    private readonly gasService: GasService,
    private readonly settingsService: SettingsService,
    private readonly oneInchEthService: OneInchEthService,
    private readonly oneInchBscService: OneInchBscService,
    private readonly oneInchPolygonService: OneInchPolygonService,
    private readonly oneInchAvalancheService: OneInchAvalancheService
  ) {}

  private isFromNative(): boolean {
    const { fromToken } = this.swapFormService.inputValue;
    return this.publicBlockchainAdapterService[fromToken.blockchain].isNativeAddress(
      fromToken.address
    );
  }

  public async needApprove(): Promise<boolean> {
    const { fromToken, fromBlockchain } = this.swapFormService.inputValue;
    if (!SymbiosisService.isSupportedBlockchain(fromBlockchain)) {
      throw new Error('Not supported blockchain');
    }

    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    return blockchainAdapter
      .getAllowance({
        tokenAddress: fromToken.address,
        ownerAddress: this.walletAddress,
        spenderAddress: SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain]
      })
      .then(allowance => allowance.eq(0));
  }

  public async approve(onTransactionHash?: (hash: string) => void): Promise<void> {
    const { fromToken, fromBlockchain } = this.swapFormService.inputValue;
    if (!SymbiosisService.isSupportedBlockchain(fromBlockchain)) {
      throw new Error('Not supported blockchain');
    }

    await this.web3PrivateService.approveTokens(
      fromToken.address,
      SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
      'infinity',
      { onTransactionHash }
    );
  }

  public async calculateTrade(): Promise<{
    trade: SymbiosisTrade;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    if (!this.walletAddress) {
      return { trade: null };
    }

    const { fromToken, fromAmount, toToken, fromBlockchain, toBlockchain } =
      this.swapFormService.inputValue;
    if (
      !SymbiosisService.isSupportedBlockchain(fromBlockchain) ||
      fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM // TODO return after fix
    ) {
      return { trade: null };
    }

    const isPaused = await this.checkIfPaused(fromBlockchain);
    if (isPaused) {
      return {
        trade: null
      };
    }

    const swapping = this.symbiosis.newSwapping();

    const fromBlockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const tokenIn = new SymbiosisToken({
      chainId: BlockchainsInfo.getBlockchainByName(fromBlockchain).id,
      address: fromBlockchainAdapter.isNativeAddress(fromToken.address) ? '' : fromToken.address,
      decimals: fromToken.decimals,
      isNative: fromBlockchainAdapter.isNativeAddress(fromToken.address)
    });
    const feePercent = await this.getFeePercent(fromBlockchain);
    const fromAmountWithoutFee = fromAmount.multipliedBy(100 - feePercent).dividedBy(100);
    const tokenAmountIn = new SymbiosisTokenAmount(
      tokenIn,
      Web3Pure.toWei(fromAmountWithoutFee, tokenIn.decimals)
    );

    const toBlockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];
    const tokenOut = new SymbiosisToken({
      chainId: BlockchainsInfo.getBlockchainByName(toBlockchain).id,
      address: toBlockchainAdapter.isNativeAddress(toToken.address) ? '' : toToken.address,
      decimals: toToken.decimals,
      isNative: toBlockchainAdapter.isNativeAddress(toToken.address)
    });

    const deadline = Math.floor(Date.now() / 1000) + 60 * this.DEFAULT_DEADLINE;
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance * 100;

    try {
      const {
        tokenAmountOut,
        transactionRequest,
        fee: transitTokenFee,
        priceImpact
      } = await swapping.exactIn(
        tokenAmountIn,
        tokenOut,
        this.walletAddress,
        this.walletAddress,
        this.walletAddress,
        slippageTolerance,
        deadline,
        true
      );
      this.transactionRequest = transactionRequest;

      return {
        trade: {
          toAmount: new BigNumber(tokenAmountOut.toFixed()),
          fee: new BigNumber(transitTokenFee.toFixed()),
          priceImpact: priceImpact.toFixed()
        }
      };
      // @ts-ignore
    } catch (err: { code: ErrorCode; message: string }) {
      if (err?.code === ErrorCode.AMOUNT_TOO_LOW || err?.code === ErrorCode.AMOUNT_LESS_THAN_FEE) {
        const index = err.message.lastIndexOf('$');
        const transitTokenAmount = new BigNumber(err.message.substring(index + 1));
        const minAmount = await this.getFromTokenAmount(fromBlockchain, transitTokenAmount, 'min');
        return {
          trade: null,
          minAmountError: minAmount
        };
      } else if (err?.code === ErrorCode.AMOUNT_TOO_HIGH) {
        const index = err.message.lastIndexOf('$');
        const transitTokenAmount = new BigNumber(err.message.substring(index + 1));
        const maxAmount = await this.getFromTokenAmount(fromBlockchain, transitTokenAmount, 'max');
        return {
          trade: null,
          maxAmountError: maxAmount
        };
      }

      return { trade: null };
    }
  }

  private async getFeePercent(fromBlockchain: SymbiosisSupportedBlockchain): Promise<number> {
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    return (
      (await blockchainAdapter.callContractMethod<number>(
        SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
        SYMBIOSIS_CONTRACT_ABI,
        'RubicFee'
      )) / 10000
    );
  }

  private async getFromTokenAmount(
    blockchain: SymbiosisSupportedBlockchain,
    transitTokenAmount: BigNumber,
    type: 'min' | 'max'
  ): Promise<BigNumber> {
    const { fromToken } = this.swapFormService.inputValue;
    const transitToken = transitTokens[blockchain];
    if (compareAddresses(fromToken.address, transitToken.address)) {
      return transitTokenAmount;
    }

    const amount = (
      await this.oneInchService[blockchain].calculateTrade(
        transitToken,
        transitTokenAmount,
        fromToken,
        false
      )
    ).to.amount;
    const approximatePercentDifference = 0.1;

    if (type === 'min') {
      return amount.multipliedBy(1 + approximatePercentDifference);
    }
    return amount.multipliedBy(1 - approximatePercentDifference);
  }

  public async getGasData(): Promise<{
    gasLimit: BigNumber;
    gasPrice: string;
  }> {
    try {
      const { fromBlockchain } = this.swapFormService.inputValue;
      if (!SymbiosisService.isSupportedBlockchain(fromBlockchain)) {
        throw new Error('Not supported blockchain');
      }

      const blockchainAdapter =
        this.publicBlockchainAdapterService[fromBlockchain as EthLikeBlockchainName];
      const { methodName, methodArguments, value } = this.getSwapMethodData();

      const gasLimit = await blockchainAdapter.getEstimatedGas(
        SYMBIOSIS_CONTRACT_ABI,
        SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
        methodName,
        methodArguments,
        this.walletAddress,
        value
      );
      const gasPrice = Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(fromBlockchain));

      return {
        gasLimit,
        gasPrice
      };
    } catch (_err) {
      return null;
    }
  }

  private checkIfPaused(fromBlockchain: SymbiosisSupportedBlockchain): Promise<boolean> {
    const web3Public = this.publicBlockchainAdapterService[fromBlockchain];

    return web3Public.callContractMethod(
      SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
      SYMBIOSIS_CONTRACT_ABI,
      'paused'
    );
  }

  public async swap(onTransactionHash: (hash: string) => void): Promise<void> {
    const { fromBlockchain } = this.swapFormService.inputValue;
    if (!SymbiosisService.isSupportedBlockchain(fromBlockchain)) {
      throw new Error('Not supported blockchain');
    }

    const { methodName, methodArguments, value } = this.getSwapMethodData();

    await this.web3PrivateService.tryExecuteContractMethod(
      SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain],
      SYMBIOSIS_CONTRACT_ABI,
      methodName,
      methodArguments,
      { value, onTransactionHash }
    );
  }

  private getSwapMethodData(): MethodData {
    const { fromToken, fromAmount } = this.swapFormService.inputValue;

    if (this.isFromNative()) {
      return {
        methodName: 'SymbiosisCallWithNative',
        methodArguments: [NATIVE_TOKEN_ADDRESS, this.transactionRequest.data],
        value: Web3Pure.toWei(fromAmount, fromToken.decimals)
      };
    }

    return {
      methodName: 'SymbiosisCall',
      methodArguments: [
        fromToken.address,
        Web3Pure.toWei(fromAmount, fromToken.decimals),
        NATIVE_TOKEN_ADDRESS,
        this.transactionRequest.data
      ]
    };
  }
}
