import { inject, Injectable, NgZone } from '@angular/core';
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
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { BlockchainAdapterFactoryService } from '@core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';

@Injectable()
export class RevealService {
  private readonly ngZone = inject(NgZone);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly adaptersFactory = inject(BlockchainAdapterFactoryService);

  constructor() {}

  public async unshieldTokens(tokenAddress: string, tokenAmount: string): Promise<void> {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), this.authService.userAddress)
    ];

    const { gasEstimate } = await this.railgunFacade.gasEstimateForUnshield(
      NetworkName.Polygon,
      erc20AmountRecipients
    );

    // generate unshield proof
    await this.railgunFacade.generateUnshieldProof(NetworkName.Polygon, erc20AmountRecipients);

    const mnemonic = await this.railgunFacade.getMnemonic();
    const { wallet } = getProviderWallet(BLOCKCHAIN_NAME.POLYGON, mnemonic);

    const transactionGasDetails = await getGasDetailsForTransaction(
      NetworkName.Polygon,
      gasEstimate,
      true,
      wallet
    );

    const overallBatchMinGasPrice = await calculateGasPrice(transactionGasDetails);

    // populate tx

    const { transaction } = await this.railgunFacade.populateUnshield(
      NetworkName.Polygon,
      erc20AmountRecipients,
      transactionGasDetails,
      overallBatchMinGasPrice
    );

    await wallet.sendTransaction(transaction);
  }
}
