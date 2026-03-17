import { inject, Injectable } from '@angular/core';
import { calculateGasPrice, RailgunERC20AmountRecipient } from '@railgun-community/shared-models';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import {
  fromRubicToPrivateChainMap,
  RailgunSupportedChain
} from '@features/privacy/providers/railgun/constants/network-map';

@Injectable()
export class RevealService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  public async unshield(
    tokenAddress: string,
    tokenAmount: string,
    proofProgress: (progress: string) => void,
    tokenBlockchain: RailgunSupportedChain
  ): Promise<void> {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), this.authService.userAddress)
    ];
    const chain = fromRubicToPrivateChainMap[tokenBlockchain];

    const { gasEstimate } = await this.railgunFacade.gasEstimateForUnshield(
      chain,
      erc20AmountRecipients
    );

    // generate unshield proof
    await this.railgunFacade.generateUnshieldProof(chain, erc20AmountRecipients, proofProgress);

    const mnemonic = await this.railgunFacade.getMnemonic();
    const { wallet } = getProviderWallet(tokenBlockchain, mnemonic);

    const transactionGasDetails = await getGasDetailsForTransaction(
      chain,
      gasEstimate,
      true,
      wallet
    );

    const overallBatchMinGasPrice = await calculateGasPrice(transactionGasDetails);

    const { transaction } = await this.railgunFacade.populateUnshield(
      chain,
      erc20AmountRecipients,
      transactionGasDetails,
      overallBatchMinGasPrice
    );

    await wallet.sendTransaction(transaction);
  }
}
