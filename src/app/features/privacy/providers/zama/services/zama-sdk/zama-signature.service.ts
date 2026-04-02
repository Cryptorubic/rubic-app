import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SignatureInfo } from './models/signature-info';
import { EvmBlockchainName } from '@cryptorubic/core';
import { ZamaTokensService } from './zama-tokens.service';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { ZamaInstanceService } from './zama-instance.service';
import { StoreService } from '@app/core/services/store/store.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class ZamaSignatureService {
  constructor(
    private readonly zamaTokensService: ZamaTokensService,
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly storeService: StoreService
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

      const startDate = Date.now();
      const startTimeStamp = Math.floor(startDate / 1000);
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
        startTimeStamp,
        expiredAtMs: new BigNumber(startDate).plus(10 * 86_400_000).toFixed(0)
      });

      this.saveSignatureInfo(this.signatureInfo, userAddress);

      return true;
    } catch (err) {
      console.error('FAILED TO UPDATE SIGNATURE', err);
      return false;
    }
  }

  public updateSignatureFromStore(userAddress: string): boolean {
    const signatureInfo = this.getSignature(userAddress);

    if (!signatureInfo) return false;

    const expiredAtMs = new BigNumber(signatureInfo.expiredAtMs);

    if (expiredAtMs.lte(Date.now())) return false;

    this._signatureInfo$.next(signatureInfo);

    return true;
  }

  private getSignature(userAddress: string): SignatureInfo | null {
    return this.storeService.getItem('ZAMA_SIGNATURES_INFO')?.[userAddress.toLowerCase()] || null;
  }

  private saveSignatureInfo(info: SignatureInfo, userAddress: string): void {
    const signatures = this.storeService.getItem('ZAMA_SIGNATURES_INFO') || {};

    signatures[userAddress.toLowerCase()] = info;

    this.storeService.setItem('ZAMA_SIGNATURES_INFO', signatures);
  }
}
