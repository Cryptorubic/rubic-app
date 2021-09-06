import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { ContractData } from 'src/app/shared/models/blockchain/ContractData';
import { wethContractDataWithMode } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/controllers/constants/wethContractData';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { TransactionReceipt } from 'web3-eth';

export class EthAndWethSwapController {
  private readonly wethContractData: ContractData;

  constructor(
    private readonly web3Public: Web3Public,
    private readonly web3PrivateService: Web3PrivateService,
    isTestingMode: boolean
  ) {
    this.wethContractData = {
      address: !isTestingMode
        ? wethContractDataWithMode.address.mainnet
        : wethContractDataWithMode.address.testnet,
      abi: wethContractDataWithMode.abi
    };
  }

  public isEthAndWethSwap(fromTokenAddress: string, toTokenAddress: string): boolean {
    return (
      (Web3Public.isNativeAddress(fromTokenAddress) &&
        toTokenAddress.toLowerCase() === this.wethContractData.address.toLowerCase()) ||
      (Web3Public.isNativeAddress(toTokenAddress) &&
        fromTokenAddress.toLowerCase() === this.wethContractData.address.toLowerCase())
    );
  }

  public swapEthToWeth(
    fromAmountAbsolute: string,
    options: { onConfirm?: (hash: string) => void }
  ): Promise<TransactionReceipt> {
    return this.web3PrivateService.executeContractMethod(
      this.wethContractData.address,
      this.wethContractData.abi,
      'deposit',
      [],
      {
        value: fromAmountAbsolute,
        onTransactionHash: options.onConfirm
      }
    );
  }

  public swapWethToEth(
    fromAmountAbsolute: string,
    options: { onConfirm?: (hash: string) => void }
  ): Promise<TransactionReceipt> {
    return this.web3PrivateService.executeContractMethod(
      this.wethContractData.address,
      this.wethContractData.abi,
      'withdraw',
      [fromAmountAbsolute],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }
}
