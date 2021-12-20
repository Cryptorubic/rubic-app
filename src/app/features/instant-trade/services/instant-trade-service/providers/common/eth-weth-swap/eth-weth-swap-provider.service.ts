import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import wethContractAbi from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/wethContractAbi';
import {
  wethContractAddressesNetMode,
  SupportedEthWethSwapBlockchain
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/wethContractAddressesNetMode';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { TransactionReceipt } from 'web3-eth';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ItOptions } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { compareAddresses } from '@shared/utils/utils';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';

@Injectable({
  providedIn: 'root'
})
export class EthWethSwapProviderService {
  private readonly abi = wethContractAbi;

  private contractAddresses: Record<SupportedEthWethSwapBlockchain, string>;

  constructor(
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService,
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
    const blockchainType = BlockchainsInfo.getBlockchainType(blockchain);
    if (blockchainType !== 'ethLike') {
      return false;
    }
    const wethAddress = this.contractAddresses[blockchain as SupportedEthWethSwapBlockchain];

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

    const fromAmountAbsolute = EthLikeWeb3Public.toWei(fromAmount);
    const swapMethod = blockchainAdapter.isNativeAddress(fromToken.address)
      ? this.swapEthToWeth
      : this.swapWethToEth;
    return swapMethod.bind(this)(blockchain, fromAmountAbsolute, options);
  }

  private swapEthToWeth(
    blockchain: BLOCKCHAIN_NAME,
    fromAmountAbsolute: string,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    return this.web3PrivateService.executeContractMethod(
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
    return this.web3PrivateService.executeContractMethod(
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
