import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import wethContractAbi from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/wethContractAbi';
import {
  wethContractAddressesNetMode,
  SupportedEthWethSwapBlockchain
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/constants/wethContractAddressesNetMode';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { TransactionReceipt } from 'web3-eth';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ItOptions } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { compareAddresses } from '@shared/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class EthWethSwapProviderService {
  private readonly abi = wethContractAbi;

  private contractAddresses: Record<SupportedEthWethSwapBlockchain, string>;

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
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

    this.providerConnectorService.checkSettings(blockchain);
    const web3Public: Web3Public = this.web3PublicService[blockchain];
    await web3Public.checkBalance(fromToken, fromAmount, this.authService.userAddress);

    const fromAmountAbsolute = Web3Public.toWei(fromAmount);
    const swapMethod = Web3Public.isNativeAddress(fromToken.address)
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
