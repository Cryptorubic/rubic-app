import { inject, Injectable, NgZone } from '@angular/core';
import {
  calculateGasPrice,
  NetworkName,
  RailgunERC20AmountRecipient,
  RailgunPopulateTransactionResponse,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import {
  getGasDetailsForTransaction,
  serializeERC20Transfer
} from '@features/privacy/providers/railgun/utils/tx-utils';
import {
  gasEstimateForUnprovenUnshield,
  generateUnshieldProof,
  populateProvedUnshield
} from '@railgun-community/wallet';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { AuthService } from '@core/services/auth/auth.service';
import { fromRubicToPrivateChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { PublicClient } from 'viem';
import { BlockchainName, EvmBlockchainName } from '@cryptorubic/core';
import { BlockchainAdapterFactoryService } from '@core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';

@Injectable()
export class RevealService {
  private readonly ngZone = inject(NgZone);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly authService = inject(AuthService);

  private readonly adaptersFactory = inject(BlockchainAdapterFactoryService);

  constructor() {}

  public async unshieldTokens(
    railginId: string,
    tokenAddress: string,
    tokenAmount: string,
    fromBlockchain: BlockchainName
  ): Promise<void> {
    const password = 'password123';
    const keys = await this.railgunFacade.unlockFromPassword(password);

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      serializeERC20Transfer(tokenAddress, BigInt(tokenAmount), this.authService.userAddress)
    ];

    const gasEstimate = await this.erc20UnshieldGasEstimate(
      fromRubicToPrivateChainMap[fromBlockchain],
      railginId,
      keys,
      erc20AmountRecipients,
      fromBlockchain
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

    const adapter = this.adaptersFactory.getAdapter(fromBlockchain as EvmBlockchainName);

    // @ts-ignore
    const publicClient = adapter.public as PublicClient;

    const transactionGasDetails = await getGasDetailsForTransaction(
      NetworkName.Polygon,
      gasEstimate,
      true,
      publicClient
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

    await adapter.signer.sendTransaction({
      txOptions: {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value
      }
    });
  }

  private async erc20UnshieldGasEstimate(
    network: NetworkName,
    railgunWalletID: string,
    encryptionKey: string,
    erc20AmountRecipients: RailgunERC20AmountRecipient[],
    fromBlockchain: BlockchainName
  ): Promise<bigint> {
    const sendWithPublicWallet = true;
    const adapter = this.adaptersFactory.getAdapter(fromBlockchain as EvmBlockchainName);

    // @ts-ignore
    const publicClient = adapter.public as PublicClient;

    const originalGasDetails = await getGasDetailsForTransaction(
      network,
      0n,
      sendWithPublicWallet,
      publicClient
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
