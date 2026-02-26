import { inject, Injectable, NgZone } from '@angular/core';
import {
  calculateGasPrice,
  NetworkName,
  RailgunERC20AmountRecipient,
  RailgunPopulateTransactionResponse,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import { MnemonicService } from '@features/privacy/providers/railgun/services/mnemonic/mnemonic.service';
import {
  getGasDetailsForTransaction,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import {
  gasEstimateForUnprovenUnshield,
  generateUnshieldProof,
  populateProvedUnshield
} from '@railgun-community/wallet';
import { EncryptionService } from '@features/privacy/providers/railgun/services/encryption/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class RevealService {
  private readonly mnemonicService = inject(MnemonicService);

  private readonly encryptionService = inject(EncryptionService);

  private readonly ngZone = inject(NgZone);

  constructor() {}

  public async unshieldTokens(
    railginId: string,
    tokenAddress: string,
    tokenAmount: string
  ): Promise<void> {
    const { wallet } = this.mnemonicService.getProviderWallet();
    const keys = await this.encryptionService.unlockFromPassword(
      this.encryptionService.lastUsedPassword
    );

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), wallet.address)
    ];

    const gasEstimate = await this.erc20UnshieldGasEstimate(
      NetworkName.Polygon,
      railginId,
      keys,
      erc20AmountRecipients
    );

    console.log('ERC20 UNSHIELD gasEstimate: ', gasEstimate);

    // generate unshield proof
    await this.erc20UnshieldGenerateProof(
      keys,
      NetworkName.Polygon,
      railginId,
      erc20AmountRecipients,
      1n
    );

    const transactionGasDetails = await getGasDetailsForTransaction(
      NetworkName.Polygon,
      gasEstimate,
      true,
      wallet
    );

    const overallBatchMinGasPrice = await calculateGasPrice(transactionGasDetails);

    // populate tx

    const { transaction } = await this.erc20UnshieldPopulateTransaction(
      NetworkName.Polygon,
      railginId,
      erc20AmountRecipients,
      overallBatchMinGasPrice,
      transactionGasDetails
    );

    const sentTx = await wallet.sendTransaction(transaction);
    console.log(sentTx);
    await sentTx.wait();
  }

  private async erc20UnshieldGasEstimate(
    network: NetworkName,
    railgunWalletID: string,
    encryptionKey: string,
    erc20AmountRecipients: RailgunERC20AmountRecipient[]
  ): Promise<bigint> {
    const sendWithPublicWallet = true;
    const { wallet } = this.mnemonicService.getProviderWallet();

    const originalGasDetails = await getGasDetailsForTransaction(
      network,
      0n,
      sendWithPublicWallet,
      wallet
    );
    // dont setup broadcaster connection for simplicity.
    const feeTokenDetails: unknown = undefined;
    console.log('unshield originalGasDetails: ', originalGasDetails);

    const { gasEstimate } = await gasEstimateForUnprovenUnshield(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      railgunWalletID,
      encryptionKey,
      erc20AmountRecipients,
      [], // nft amount recipients
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet
    );

    return gasEstimate;
  }

  private async erc20UnshieldGenerateProof(
    encryptionKey: string,
    network: NetworkName,
    railgunWalletID: string,
    tokenAmountRecipients: RailgunERC20AmountRecipient[],
    overallBatchMinGasPrice: bigint,
    sendWithPublicWallet: boolean = true,
    broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient | undefined = undefined
  ): Promise<void> {
    const progressCallback = (progress: number) => {
      // Handle proof progress (show in UI).
      // Proofs can take 20-30 seconds on slower devices.
      console.log('Unshield ERC20 Proof progress: ', progress);
    };
    await this.ngZone.runOutsideAngular(async () => {
      await generateUnshieldProof(
        TXIDVersion.V2_PoseidonMerkle,
        network,
        railgunWalletID,
        encryptionKey,
        tokenAmountRecipients,
        [], // nft amount recipients
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        progressCallback
      );
    });
  }

  private async erc20UnshieldPopulateTransaction(
    network: NetworkName,
    railgunWalletID: string,
    tokenAmountRecipients: RailgunERC20AmountRecipient[],
    overallBatchMinGasPrice: bigint,
    transactionGasDetails: TransactionGasDetails,
    sendWithPublicWallet: boolean = true,
    broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient | undefined = undefined
  ): Promise<RailgunPopulateTransactionResponse> {
    const populateResponse = await populateProvedUnshield(
      TXIDVersion.V2_PoseidonMerkle,
      network,
      railgunWalletID,
      tokenAmountRecipients,
      [], // nftAmountRecipients
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      transactionGasDetails
    );

    return populateResponse;
  }
}
