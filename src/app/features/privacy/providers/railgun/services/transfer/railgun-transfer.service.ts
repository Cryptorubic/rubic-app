import { inject, Injectable } from '@angular/core';
import { calculateGasPrice, RailgunERC20AmountRecipient } from '@railgun-community/shared-models';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import {
  fromRubicToPrivateChainMap,
  RailgunSupportedChain
} from '@features/privacy/providers/railgun/constants/network-map';

@Injectable()
export class RailgunTransferService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  public async transferTokens(
    tokenAddress: string,
    tokenAmount: string,
    receiver: string,
    proofProgress: (progress: string) => void,
    blockchain: RailgunSupportedChain
  ): Promise<void> {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), receiver)
    ];
    const chain = fromRubicToPrivateChainMap[blockchain];

    const { gasEstimate } = await this.railgunFacade.gasEstimateForTransfer(
      chain,
      erc20AmountRecipients
    );

    // generate proof
    await this.railgunFacade.generateTransferProof(chain, erc20AmountRecipients, proofProgress);

    const mnemonic = await this.railgunFacade.getMnemonic();
    const { wallet } = getProviderWallet(blockchain, mnemonic);

    const transactionGasDetails = await getGasDetailsForTransaction(
      chain,
      gasEstimate,
      true,
      wallet
    );

    const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);

    // populate tx

    const { transaction } = await this.railgunFacade.populateTransfer(
      chain,
      erc20AmountRecipients,
      transactionGasDetails,
      overallBatchMinGasPrice
    );

    await wallet.sendTransaction(transaction);
  }
}
