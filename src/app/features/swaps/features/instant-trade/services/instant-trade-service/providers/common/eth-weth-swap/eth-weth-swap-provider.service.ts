import { Injectable } from '@angular/core';
import {
  BlockchainName,
  EvmBlockchainName,
  EvmWeb3Pure,
  Injector,
  Token,
  Web3Pure
} from 'rubic-sdk';
import wethContractAbi from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/weth-contract-abi';
import {
  SupportedEthWethSwapBlockchain,
  WETH_CONTRACT_ADDRESS
} from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/weth-contract-addresses-net-mode';
import { TransactionReceipt } from 'web3-eth';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { compareAddresses } from '@shared/utils/utils';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-options';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';
import { GasService } from '@core/services/gas-service/gas.service';

@Injectable({
  providedIn: 'root'
})
export class EthWethSwapProviderService {
  private readonly abi = wethContractAbi;

  private readonly contractAddress = WETH_CONTRACT_ADDRESS;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly gasService: GasService
  ) {}

  public isEthAndWethSwap(
    blockchain: BlockchainName,
    fromTokenAddress: string,
    toTokenAddress: string
  ): boolean {
    const wethAddress = this.contractAddress[blockchain as SupportedEthWethSwapBlockchain];

    return (
      (fromTokenAddress === NATIVE_TOKEN_ADDRESS &&
        compareAddresses(toTokenAddress, wethAddress)) ||
      (toTokenAddress === NATIVE_TOKEN_ADDRESS && compareAddresses(fromTokenAddress, wethAddress))
    );
  }

  public async createTrade(trade: WrapTrade, options: ItOptions): Promise<string> {
    const { blockchain } = trade;
    const fromToken = trade.from.token;
    const fromAmount = trade.from.amount;

    await Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .checkBlockchainCorrect(blockchain);
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      blockchain as EvmBlockchainName
    );
    await blockchainAdapter.checkBalance(
      fromToken as Token,
      fromAmount,
      this.authService.userAddress
    );

    const fromAmountAbsolute = Web3Pure.toWei(fromAmount);
    const swapMethod = EvmWeb3Pure.isNativeAddress(fromToken.address)
      ? this.swapEthToWeth
      : this.swapWethToEth;
    const receipt: TransactionReceipt = await swapMethod.bind(this)(
      blockchain,
      fromAmountAbsolute,
      options
    );
    return receipt.transactionHash;
  }

  private async swapEthToWeth(
    blockchain: BlockchainName,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    return Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .executeContractMethod(
        this.contractAddress[blockchain as SupportedEthWethSwapBlockchain],
        this.abi,
        'deposit',
        [],
        {
          value: fromAmountAbsolute,
          onTransactionHash: options.onConfirm,
          ...(shouldCalculateGasPrice && { gasPriceOptions })
        }
      );
  }

  private async swapWethToEth(
    blockchain: BlockchainName,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    return Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .executeContractMethod(
        this.contractAddress[blockchain as SupportedEthWethSwapBlockchain],
        this.abi,
        'withdraw',
        [fromAmountAbsolute],
        {
          onTransactionHash: options.onConfirm,
          ...(shouldCalculateGasPrice && { gasPriceOptions })
        }
      );
  }
}
