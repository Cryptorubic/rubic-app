import { Injectable } from '@angular/core';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import wethContractAbi from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/weth-contract-abi';
import {
  SupportedEthWethSwapBlockchain,
  WETH_CONTRACT_ADDRESS
} from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/weth-contract-addresses-net-mode';
import { TransactionReceipt } from 'web3-eth';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-provider';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { compareAddresses } from '@shared/utils/utils';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class EthWethSwapProviderService {
  private readonly abi = wethContractAbi;

  private readonly contractAddress = WETH_CONTRACT_ADDRESS;

  constructor(
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService
  ) {}

  public isEthAndWethSwap(
    blockchain: BlockchainName,
    fromTokenAddress: string,
    toTokenAddress: string
  ): boolean {
    const blockchainType = BlockchainsInfo.getBlockchainType(blockchain);
    if (blockchainType !== 'ethLike') {
      return false;
    }
    const wethAddress = this.contractAddress[blockchain as SupportedEthWethSwapBlockchain];

    return (
      (fromTokenAddress === NATIVE_TOKEN_ADDRESS &&
        compareAddresses(toTokenAddress, wethAddress)) ||
      (toTokenAddress === NATIVE_TOKEN_ADDRESS && compareAddresses(fromTokenAddress, wethAddress))
    );
  }

  public async createTrade(trade: InstantTrade, options: ItOptions): Promise<TransactionReceipt> {
    const { blockchain } = trade;
    const fromToken = trade.from.token;
    const fromAmount = trade.from.amount;

    this.walletConnectorService.checkSettings(blockchain);
    const blockchainAdapter = this.publicBlockchainAdapterService[blockchain];
    await blockchainAdapter.checkBalance(fromToken, fromAmount, this.authService.userAddress);

    const fromAmountAbsolute = Web3Pure.toWei(fromAmount);
    const swapMethod = blockchainAdapter.isNativeAddress(fromToken.address)
      ? this.swapEthToWeth
      : this.swapWethToEth;
    return swapMethod.bind(this)(blockchain, fromAmountAbsolute, options);
  }

  private swapEthToWeth(
    blockchain: BlockchainName,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    return this.web3PrivateService.executeContractMethod(
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
    return this.web3PrivateService.executeContractMethod(
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
