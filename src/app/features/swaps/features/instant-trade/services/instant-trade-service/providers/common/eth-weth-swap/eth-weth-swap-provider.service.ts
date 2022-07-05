import { Injectable } from '@angular/core';
import { BlockchainName, Web3Public, Web3Pure } from 'rubic-sdk';
import wethContractAbi from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/weth-contract-abi';
import {
  SupportedEthWethSwapBlockchain,
  WETH_CONTRACT_ADDRESS
} from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/weth-contract-addresses-net-mode';
import { TransactionReceipt } from 'web3-eth';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { compareAddresses } from '@shared/utils/utils';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-options';

@Injectable({
  providedIn: 'root'
})
export class EthWethSwapProviderService {
  private readonly abi = wethContractAbi;

  private readonly contractAddress = WETH_CONTRACT_ADDRESS;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService
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

  public async createTrade(trade: WrapTrade, options: ItOptions): Promise<TransactionReceipt> {
    const { blockchain } = trade;
    const fromToken = trade.from.token;
    const fromAmount = trade.from.amount;

    this.walletConnectorService.checkSettings(blockchain);
    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    await blockchainAdapter.checkBalance(fromToken, fromAmount, this.authService.userAddress);

    const fromAmountAbsolute = Web3Pure.toWei(fromAmount);
    const swapMethod = Web3Pure.isNativeAddress(fromToken.address)
      ? this.swapEthToWeth
      : this.swapWethToEth;
    return swapMethod.bind(this)(blockchain, fromAmountAbsolute, options);
  }

  private swapEthToWeth(
    blockchain: BlockchainName,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    return Injector.web3Private.executeContractMethod(
      this.contractAddress[blockchain as SupportedEthWethSwapBlockchain],
      this.abi,
      'deposit',
      [],
      {
        value: fromAmountAbsolute,
        onTransactionHash: options.onConfirm
      }
    );
  }

  private swapWethToEth(
    blockchain: BlockchainName,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    return Injector.web3Private.executeContractMethod(
      this.contractAddress[blockchain as SupportedEthWethSwapBlockchain],
      this.abi,
      'withdraw',
      [fromAmountAbsolute],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }
}
