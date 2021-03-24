import { Injectable } from '@angular/core';
import { WETH } from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../../models/InstantTrade';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { UniSwapContractAbi, UniSwapContractAddress } from './uni-swap-contract';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from '../../models/InstantTradeToken';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { BlockchainsInfo } from '../../../../../core/services/blockchain/blockchain-info';

interface UniSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH'
}

@Injectable()
export class UniSwapService extends InstantTradeService {
  static slippageTolerance = 0.015; // 1.5%

  static tokensToTokensEstimatedGas = new BigNumber(120_000);

  static tokensToEthEstimatedGas = new BigNumber(150_000);

  static ethToTokensEstimatedGas = new BigNumber(150_000);

  private WETH;

  constructor(
    private coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    useTestingModeService: UseTestingModeService
  ) {
    super();

    useTestingModeService.isTestingMode.subscribe(value => {
      this.isTestingMode = value;
      const testnetId = BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.ETHEREUM_TESTNET).id;
      this.WETH = WETH[testnetId.toString()];
      this.web3Public = web3Public[BLOCKCHAIN_NAME.ETHEREUM];
    });

    this.web3Private = web3Private;
    this.web3Public = web3Public[BLOCKCHAIN_NAME.ETHEREUM];
    this.WETH = WETH['1'];
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };
    let estimatedGasPredictionMethod = 'calculateTokensToTokensGasLimit';

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.WETH.address;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.WETH.address;
      estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
    }

    const amountOut = await this.getToAmount(fromAmount, fromTokenClone, toTokenClone);

    const amountIn = fromAmount.multipliedBy(10 ** fromTokenClone.decimals).toFixed(0);
    const amountOutMin = amountOut
      .multipliedBy(new BigNumber(1).minus(UniSwapService.slippageTolerance))
      .toFixed(0);

    const path = [fromTokenClone.address, toTokenClone.address];
    const to = this.web3Private.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const estimatedGas = await this[estimatedGasPredictionMethod](
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    );

    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();

    const gasFeeInUsd = await this.web3Public.getGasFee(estimatedGas, ethPrice);
    const gasFeeInEth = await this.web3Public.getGasFee(estimatedGas, new BigNumber(1));

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: amountOut.div(10 ** toToken.decimals)
      },
      estimatedGas,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async calculateTokensToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = UniSwapService.tokensToTokensEstimatedGas;
    if (walletAddress) {
      const allowance = await this.web3Public.getAllowance(
        path[0],
        walletAddress,
        UniSwapContractAddress
      );
      const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
      if (allowance.gte(amountIn) && balance.gte(amountIn)) {
        estimatedGas = await this.web3Public.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          SWAP_METHOD.TOKENS_TO_TOKENS,
          [amountIn, amountOutMin, path, walletAddress, deadline],
          walletAddress
        );
      }
    }

    return estimatedGas;
  }

  private async calculateEthToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    if (walletAddress) {
      const balance = await this.web3Public.getBalance(walletAddress);
      return balance.gte(amountIn)
        ? this.web3Public.getEstimatedGas(
            UniSwapContractAbi,
            UniSwapContractAddress,
            SWAP_METHOD.ETH_TO_TOKENS,
            [amountOutMin, path, walletAddress, deadline],
            walletAddress,
            amountIn
          )
        : UniSwapService.ethToTokensEstimatedGas;
    }
    return UniSwapService.ethToTokensEstimatedGas;
  }

  private async calculateTokensToEthGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = UniSwapService.tokensToEthEstimatedGas;
    if (walletAddress) {
      const allowance = await this.web3Public.getAllowance(
        path[0],
        walletAddress,
        UniSwapContractAddress
      );
      const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
      if (allowance.gte(amountIn) && balance.gte(amountIn)) {
        estimatedGas = await this.web3Public.getEstimatedGas(
          UniSwapContractAbi,
          UniSwapContractAddress,
          SWAP_METHOD.TOKENS_TO_ETH,
          [amountIn, amountOutMin, path, walletAddress, deadline],
          walletAddress
        );
      }
    }

    return estimatedGas;
  }

  public async createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.checkBalance(trade);
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(UniSwapService.slippageTolerance))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const path = [trade.from.token.address, trade.to.token.address];
    const to = this.web3Private.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const uniSwapTrade: UniSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      return this.createEthToTokensTrade(uniSwapTrade, options);
    }

    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      return this.createTokensToEthTrade(uniSwapTrade, options);
    }

    return this.createTokensToTokensTrade(uniSwapTrade, options);
  }

  private async createEthToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[0] = this.WETH.address;

    return this.web3Private.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn
      }
    );
  }

  private async createTokensToEthTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    trade.path[1] = this.WETH.address;

    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      UniSwapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }

  private async createTokensToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      UniSwapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      { onTransactionHash: options.onConfirm }
    );
  }

  /* private async getUniSwapTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<Trade> {
    const chainId = (this.web3Private.network?.id as ChainId) || ChainId.MAINNET;
    const uniSwapFromToken = new Token(chainId, fromToken.address, fromToken.decimals);
    const uniSwapToToken = new Token(chainId, toToken.address, toToken.decimals);
    const pair = await Fetcher.fetchPairData(uniSwapFromToken, uniSwapToToken, this.provider);
    const route = new Route([pair], uniSwapFromToken);

    const fullFromAmount = fromAmount.multipliedBy(10 ** fromToken.decimals);

    return new Trade(
      route,
      new TokenAmount(uniSwapFromToken, fullFromAmount.toFixed(0)),
      TradeType.EXACT_INPUT
    );
  } */

  private async getToAmount(
    fromAmountRelative: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<BigNumber> {
    const absoluteAmount = fromAmountRelative.multipliedBy(10 ** fromToken.decimals).toFixed(0);
    const path = [fromToken.address, toToken.address];
    const response: string[] = await this.web3Public.callContractMethod(
      UniSwapContractAddress,
      UniSwapContractAbi,
      'getAmountsOut',
      { methodArguments: [absoluteAmount, path] }
    );

    return new BigNumber(response[1]);
  }
}
