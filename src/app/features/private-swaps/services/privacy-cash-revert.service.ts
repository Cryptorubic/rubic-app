import { Injectable } from '@angular/core';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import { NATIVE_SOL_ADDRESS } from '../constants/privacycash-consts';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

@Injectable()
export class PrivacyCashRevertService {
  constructor(private readonly sdkLegacyService: SdkLegacyService) {}

  public async revertTokens(): Promise<void> {
    const tokenAddr: string = document.querySelectorAll('input')[6].value;
    const amount: string = document.querySelectorAll('input')[8].value;
    const receiverAddr: string = document.querySelectorAll('input')[9].value;

    if (tokenAddr === NATIVE_SOL_ADDRESS) {
      return this.revertNative(Number(amount), receiverAddr);
    }
    return this.revertSPL(tokenAddr, receiverAddr);
  }

  public async revertNative(amount: number, receiverAddr: string): Promise<void> {
    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;

    // 2. Load sender keypair (replace with actual secret key)
    const burnerKeypair = this.getKeypairFromSecret();
    const recipientAddress = new PublicKey(receiverAddr);

    // 3. Create transaction instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: burnerKeypair.publicKey,
        toPubkey: recipientAddress,
        lamports: amount * LAMPORTS_PER_SOL // Amount in SOL
      })
    );

    // 4. Sign, send and confirm
    const signature = await sendAndConfirmTransaction(connection, transaction, [burnerKeypair]);

    console.debug('Transaction signature:', signature);
  }

  public async revertSPL(tokenAddr: string, receiverAddr: string): Promise<void> {
    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;

    const senderKeypair = this.getKeypairFromSecret();
    const recipientAddress = new PublicKey(receiverAddr);
    const mintAddress = new PublicKey(tokenAddr);

    const decimals: string = document.querySelectorAll('input')[7].value;
    const revertAmount: string = document.querySelectorAll('input')[8].value;

    const transferAmount = Number(revertAmount);
    const tokenDecimals = Number(decimals);

    console.debug('START');

    try {
      console.debug("Get or create the sender's Associated Token Account (ATA)");
      // 1. Get or create the sender's Associated Token Account (ATA)
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderKeypair, // Payer for potential ATA creation
        mintAddress,
        senderKeypair.publicKey // Owner of the ATA
      );

      console.debug("Get or create the recipient's Associated Token Account (ATA)");
      // 2. Get or create the recipient's Associated Token Account (ATA)
      // The sender's keypair will pay for the creation if the recipient's ATA doesn't exist
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderKeypair, // Payer
        mintAddress,
        recipientAddress // Owner of the ATA
      );

      console.debug(
        "Create the transfer instruction (using the high-level 'transfer' function for simplicity)"
      );
      // 3. Create the transfer instruction (using the high-level 'transfer' function for simplicity)
      const signature = await transfer(
        connection,
        senderKeypair, // Payer of the transaction
        fromTokenAccount.address, // Source ATA
        toTokenAccount.address, // Destination ATA
        senderKeypair.publicKey, // Owner of the source ATA (must sign)
        transferAmount * Math.pow(10, tokenDecimals) // Amount in raw integers (accounting for decimals)
      );

      console.debug('Token Transfer successful!');
      console.debug(`Transaction signature: ${signature}`);
      console.debug(`View on Explorer: https://explorer.solana.com{signature}?cluster=devnet`);
    } catch (error) {
      console.error('Token transfer failed:', error);
    }
  }

  private getKeypairFromSecret(): Keypair | null {
    const burnerSecretKey = localStorage.getItem('PRIVATE_KEY');
    const array = burnerSecretKey.split(',').map(s => parseInt(s));
    const secretKey = Uint8Array.from(array);

    return Keypair.fromSecretKey(secretKey);
  }
}
