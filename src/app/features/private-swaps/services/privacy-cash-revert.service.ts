import { Injectable } from '@angular/core';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BLOCKCHAIN_NAME, Token, nativeTokensList } from '@cryptorubic/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivacyCashSignatureService } from './privacy-cash-signature.service';
import { compareAddresses } from '@app/shared/utils/utils';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Injectable()
export class PrivacyCashRevertService {
  constructor(
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privacycashSignatureService: PrivacyCashSignatureService,
    private readonly notificationsService: NotificationsService
  ) {}

  /**
   * @param tokenAddr rubic compatible addr (native is So11111111111111111111111111111111111111111)
   */
  public async refundTokens(tokenAddr: string, receiverAddr: string): Promise<void> {
    if (compareAddresses(tokenAddr, nativeTokensList.SOLANA.address)) {
      return this.revertNative(receiverAddr);
    }
    return this.revertSPL(tokenAddr, receiverAddr);
  }

  private async revertNative(receiverAddr: string): Promise<void> {
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(BLOCKCHAIN_NAME.SOLANA);
    const senderPK = new PublicKey(this.walletConnectorService.address);
    const receiverPK = new PublicKey(receiverAddr);

    const burnerKeypair =
      await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
        this.privacycashSignatureService.signature,
        senderPK,
        0
      );
    const burnerWalletBalanceWei = await adapter.getBalance(burnerKeypair.publicKey.toBase58());
    const amountLeftForGasWei = Token.toWei(0.0033, nativeTokensList.SOLANA.decimals);
    const availableBalanceToRefundWei = burnerWalletBalanceWei.minus(amountLeftForGasWei);
    if (availableBalanceToRefundWei.lte(0)) {
      this.notificationsService.showWarning('Nothing to refund.');
      return;
    }

    const transferBlockhash = await adapter.public.getLatestBlockhash();
    const transaction = new Transaction({
      feePayer: burnerKeypair.publicKey,
      blockhash: transferBlockhash.blockhash,
      lastValidBlockHeight: transferBlockhash.lastValidBlockHeight
    }).add(
      SystemProgram.transfer({
        fromPubkey: burnerKeypair.publicKey,
        toPubkey: receiverPK,
        lamports: availableBalanceToRefundWei.toNumber()
      })
    );
    transaction.sign(burnerKeypair);

    const signature = await adapter.public.sendRawTransaction(transaction.serialize());

    console.debug('[PrivacyCashRevertService_revertNative] signature:', signature);
    this.notificationsService.showInfo('Successfull refund.');
  }

  private async revertSPL(tokenAddr: string, receiverAddr: string): Promise<void> {
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(BLOCKCHAIN_NAME.SOLANA);
    const userPK = new PublicKey(this.walletConnectorService.address);
    const receiverPK = new PublicKey(receiverAddr);
    const mintPK = new PublicKey(tokenAddr);

    const burnerKeypair =
      await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
        this.privacycashSignatureService.signature,
        userPK,
        0
      );
    const burnerWalletBalanceWei = await adapter.getBalance(
      burnerKeypair.publicKey.toBase58(),
      tokenAddr
    );
    if (burnerWalletBalanceWei.lte(0)) {
      this.notificationsService.showWarning('Nothing to refund.');
      return;
    }

    const burnerATA = await getOrCreateAssociatedTokenAccount(
      adapter.public,
      burnerKeypair,
      mintPK,
      burnerKeypair.publicKey
    );
    const recipientATA = await getOrCreateAssociatedTokenAccount(
      adapter.public,
      burnerKeypair,
      mintPK,
      receiverPK
    );
    const transferInstruction = createTransferInstruction(
      burnerATA.address,
      recipientATA.address,
      burnerKeypair.publicKey,
      burnerWalletBalanceWei.toNumber(),
      [],
      TOKEN_PROGRAM_ID
    );

    const transferBlockhash = await adapter.public.getLatestBlockhash();
    let transaction = new Transaction({
      feePayer: burnerKeypair.publicKey,
      blockhash: transferBlockhash.blockhash,
      lastValidBlockHeight: transferBlockhash.lastValidBlockHeight
    }).add(transferInstruction);
    transaction.sign(burnerKeypair);

    const signature = await adapter.public.sendRawTransaction(transaction.serialize());

    console.debug('[PrivacyCashRevertService_revertSPL] signature:', signature);
    this.notificationsService.showInfo('Successfull refund.');
  }
}
