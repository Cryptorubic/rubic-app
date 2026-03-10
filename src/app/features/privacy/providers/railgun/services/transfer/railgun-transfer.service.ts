import { inject, Injectable } from '@angular/core';
import {
  calculateGasPrice,
  NetworkName,
  RailgunERC20AmountRecipient
} from '@railgun-community/shared-models';
import {
  getGasDetailsForTransaction,
  getProviderWallet,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable()
export class RailgunTransferService {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  constructor() {}

  public async transferTokens(
    tokenAddress: string,
    tokenAmount: string,
    receiver: string,
    proofProgress: (progress: string) => void
  ): Promise<void> {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), receiver)
    ];

    const { gasEstimate } = await this.railgunFacade.gasEstimateForTransfer(
      NetworkName.Polygon,
      erc20AmountRecipients
    );

    // generate proof
    await this.railgunFacade.generateTransferProof(
      NetworkName.Polygon,
      erc20AmountRecipients,
      proofProgress
    );

    const mnemonic = await this.railgunFacade.getMnemonic();
    const { wallet } = getProviderWallet(BLOCKCHAIN_NAME.POLYGON, mnemonic);

    const transactionGasDetails = await getGasDetailsForTransaction(
      NetworkName.Polygon,
      gasEstimate,
      true,
      wallet
    );

    const overallBatchMinGasPrice = calculateGasPrice(transactionGasDetails);

    // populate tx

    const { transaction } = await this.railgunFacade.populateTransfer(
      NetworkName.Polygon,
      erc20AmountRecipients,
      transactionGasDetails,
      overallBatchMinGasPrice
    );

    await wallet.sendTransaction(transaction);
  }
}
