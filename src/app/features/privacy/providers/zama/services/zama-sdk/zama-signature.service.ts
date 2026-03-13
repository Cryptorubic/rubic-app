import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SignatureInfo } from './models/signature-info';
import { EvmBlockchainName } from '@cryptorubic/core';
import { ZamaTokensService } from './zama-tokens.service';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { ZamaInstanceService } from './zama-instance.service';

@Injectable()
export class ZamaSignatureService {
  constructor(
    private readonly zamaTokensService: ZamaTokensService,
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly zamaInstanceService: ZamaInstanceService
  ) {}

  private readonly _signatureInfo$ = new BehaviorSubject<SignatureInfo | null>(null);

  public readonly signatureInfo$ = this._signatureInfo$.asObservable();

  public get signatureInfo(): SignatureInfo {
    return this._signatureInfo$.getValue();
  }

  public resetSignature(): void {
    this._signatureInfo$.next(null);
  }

  public async updateSignature(
    userAddress: string | null,
    blockchain: EvmBlockchainName
  ): Promise<boolean> {
    try {
      const shieldedAddressesToSign = this.zamaTokensService.supportedTokensMapping[blockchain].map(
        token => token.shieldedTokenAddress
      );

      const startTimeStamp = Math.floor(Date.now() / 1000);
      const durationDays = 10;

      const zamaInstance = this.zamaInstanceService.getInstance(blockchain);
      const keyPair = zamaInstance.generateKeypair();

      const eip712 = zamaInstance.createEIP712(
        keyPair.publicKey,
        shieldedAddressesToSign,
        startTimeStamp,
        durationDays
      );

      const adapter = this.adapterFactory.getAdapter(blockchain);

      const signature = await adapter.signer.wallet.signTypedData({
        domain: eip712.domain,
        message: {
          ...eip712.message,
          startTimestamp: BigInt(eip712.message.startTimestamp),
          durationDays: BigInt(eip712.message.durationDays)
        },
        types: eip712.types,
        primaryType: 'UserDecryptRequestVerification',
        account: userAddress as `0x${string}`
      });

      this._signatureInfo$.next({
        signature,
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        durationDays,
        startTimeStamp
      });
      return true;
    } catch (err) {
      console.error('FAILED TO UPDATE SIGNATURE', err);
      return false;
    }
  }
}
