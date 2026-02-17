import { Injectable } from '@angular/core';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import { WRAP_SOL_ADDRESS } from '../constants/privacycash-consts';
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BLOCKCHAIN_NAME, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivacyCashSignatureService } from './privacy-cash-signature.service';

@Injectable()
export class PrivacyCashRevertService {
  constructor(
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privacycashSignatureService: PrivacyCashSignatureService
  ) {}

  public async refundTokens(
    tokenAddr: string,
    amountNonWei: number,
    decimals: number,
    receiverAddr: string
  ): Promise<void> {
    if (tokenAddr === WRAP_SOL_ADDRESS) {
      return this.revertNative(amountNonWei, receiverAddr);
    }
    return this.revertSPL(tokenAddr, amountNonWei, decimals, receiverAddr);
  }

  private async revertNative(amountNonWei: number, receiverAddr: string): Promise<void> {
    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;
    const senderPK = new PublicKey(this.walletConnectorService.address);
    const receiverPK = new PublicKey(receiverAddr);

    const burnerKeypair =
      await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
        this.privacycashSignatureService.signature,
        senderPK,
        0
      );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: burnerKeypair.publicKey,
        toPubkey: receiverPK,
        lamports: new BigNumber(Token.toWei(amountNonWei, 9)).toNumber()
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [burnerKeypair], {
      commitment: 'processed'
    });
    console.debug('Transaction signature:', signature);
  }

  private async revertSPL(
    tokenAddr: string,
    amountNonWei: number,
    decimals: number,
    receiverAddr: string
  ): Promise<void> {
    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;
    const userPK = new PublicKey(this.walletConnectorService.address);
    const receiverPK = new PublicKey(receiverAddr);
    const mintPK = new PublicKey(tokenAddr);

    const burnerKeypair =
      await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
        this.privacycashSignatureService.signature,
        userPK,
        0
      );

    try {
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        burnerKeypair,
        mintPK,
        burnerKeypair.publicKey
      );
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        burnerKeypair,
        mintPK,
        receiverPK
      );
      const signature = await transfer(
        connection,
        burnerKeypair,
        fromTokenAccount.address,
        toTokenAccount.address,
        burnerKeypair.publicKey,
        new BigNumber(Token.toWei(amountNonWei, decimals)).toNumber(),
        [],
        { skipPreflight: true, commitment: 'processed' }
      );
      console.debug('Refund successful! Signature:', signature);
    } catch (error) {
      console.error('[PrivacyCashRevertService_revertSPL] error:', error);
    }
  }
}
