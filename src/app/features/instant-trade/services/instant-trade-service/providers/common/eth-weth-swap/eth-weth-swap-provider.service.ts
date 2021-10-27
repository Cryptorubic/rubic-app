import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import wethContractAbi from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/wethContractAbi';
import {
  wethContractAddressesNetMode,
  SupportedEthWethSwapBlockchain
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/wethContractAddressesNetMode';
import { TransactionReceipt } from 'web3-eth';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ItOptions } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { BlockchainPublicAdapter } from 'src/app/core/services/blockchain/blockchain-public/types';

@Injectable({
  providedIn: 'root'
})
export class EthWethSwapProviderService {
  private readonly abi = wethContractAbi;

  private contractAddresses: Record<SupportedEthWethSwapBlockchain, string>;

  constructor(
    private readonly blockchainPublicService: BlockchainPublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly useTestingMode: UseTestingModeService
  ) {
    this.contractAddresses = wethContractAddressesNetMode.mainnet;

    useTestingMode.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.contractAddresses = wethContractAddressesNetMode.testnet;
      }
    });
  }

  public isEthAndWethSwap(
    blockchain: BLOCKCHAIN_NAME,
    fromTokenAddress: string,
    toTokenAddress: string
  ): boolean {
    const wethAddress =
      this.contractAddresses[blockchain as SupportedEthWethSwapBlockchain]?.toLowerCase?.();
    return (
      (fromTokenAddress === NATIVE_TOKEN_ADDRESS && toTokenAddress.toLowerCase() === wethAddress) ||
      (toTokenAddress === NATIVE_TOKEN_ADDRESS && fromTokenAddress.toLowerCase() === wethAddress)
    );
  }

  public async createTrade(trade: InstantTrade, options: ItOptions): Promise<TransactionReceipt> {
    const { blockchain } = trade;
    const fromToken = trade.from.token;
    const fromAmount = trade.from.amount;

    this.providerConnectorService.checkSettings(blockchain);
    const blockchainPublicAdapter: BlockchainPublicAdapter =
      this.blockchainPublicService.adapters[blockchain];
    await blockchainPublicAdapter.checkBalance(fromToken, fromAmount, this.authService.userAddress);

    const fromAmountAbsolute = BlockchainPublicService.toWei(fromAmount);
    const swapMethod = blockchainPublicAdapter.isNativeAddress(fromToken.address)
      ? this.swapEthToWeth
      : this.swapWethToEth;
    return swapMethod.bind(this)(blockchain, fromAmountAbsolute, options);
  }

  private swapEthToWeth(
    blockchain: BLOCKCHAIN_NAME,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    return this.providerConnectorService.provider.executeContractMethod(
      this.contractAddresses[blockchain as SupportedEthWethSwapBlockchain],
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
    blockchain: BLOCKCHAIN_NAME,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    return this.providerConnectorService.provider.executeContractMethod(
      this.contractAddresses[blockchain as SupportedEthWethSwapBlockchain],
      this.abi,
      'withdraw',
      [fromAmountAbsolute],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }
}
