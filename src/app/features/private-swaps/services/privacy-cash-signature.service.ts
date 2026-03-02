import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { WalletNotConnectedError } from '@cryptorubic/web3';
import { Keypair, PublicKey } from '@solana/web3.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EncryptionService } from 'privacycash/utils';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { WasmFactory, LightWasm } from '@lightprotocol/hasher.rs';

@Injectable()
export class PrivacyCashSignatureService {
  private readonly _encryptionService: EncryptionService;

  private _lightWasm: LightWasm;

  private readonly _signature$ = new BehaviorSubject<Uint8Array | null>(null);

  public readonly signature$ = this._signature$.asObservable();

  public get signature(): Uint8Array | null {
    return this._signature$.value;
  }

  public setSignature(signature: Uint8Array): void {
    this._signature$.next(signature);
  }

  public get lightWasm(): LightWasm {
    return this._lightWasm;
  }

  public get encryptionService(): EncryptionService {
    return this._encryptionService;
  }

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly notificationsService: NotificationsService,
    private readonly destroy$: TuiDestroyService
  ) {
    this._encryptionService = new EncryptionService();
    WasmFactory.getInstance().then(wasmFactory => (this._lightWasm = wasmFactory));

    this.subscribeOnWalletChanged();
  }

  private subscribeOnWalletChanged(): void {
    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._signature$.next(null);
    });
  }

  public async makeSignature(): Promise<Uint8Array> {
    const wallet = this.walletConnectorService.provider?.wallet;
    const userAddr = this.walletConnectorService.address;
    const userNetwork = this.walletConnectorService.network;

    if (!userAddr || !wallet || userNetwork !== BLOCKCHAIN_NAME.SOLANA) {
      this.notificationsService.showWarning('Connect solana wallet to sign.');
      throw new WalletNotConnectedError();
    }

    const encodedMessage = new TextEncoder().encode(`Privacy Money account sign in`);

    try {
      const resp = await wallet.signMessage(encodedMessage, 'utf8');

      this.setSignature(resp.signature);
      this.encryptionService.deriveEncryptionKeyFromSignature(resp.signature);

      return resp.signature;
    } catch (err) {
      throw new Error('Failed to sign message: ' + err.message);
    }
  }

  public async checkRequirements(): Promise<void> {
    const wallet = this.walletConnectorService.provider?.wallet;
    const userAddr = this.walletConnectorService.address;
    const connectedChain = this.walletConnectorService.network;

    if (!wallet || !userAddr) {
      const msg = 'Wallet not connected';
      this.notificationsService.showWarning(msg);
      throw new Error(msg);
    }
    if (connectedChain !== BLOCKCHAIN_NAME.SOLANA) {
      const msg = 'SOLANA network not connected';
      this.notificationsService.showWarning(msg);
      throw new Error(msg);
    }

    if (!this.signature) await this.makeSignature();
  }

  public async deriveSolanaKeypairFromEncryptionKeyBase58(
    ikm: Uint8Array,
    publicKey: PublicKey,
    index: number
  ): Promise<Keypair> {
    if (index < 0 || !Number.isInteger(index))
      throw new Error('index must be a non-negative integer');
    if (ikm.length < 32) {
      throw new Error(`Decoded encryptionKey is only ${ikm.length} bytes (<32).`);
    }

    const saltContext = 'privacycash:v1:' + publicKey.toBase58();
    const msgBuffer = new TextEncoder().encode(saltContext);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const salt = new Uint8Array(hashBuffer);
    const info = new TextEncoder().encode(`privacycash:solana:wallet:v1:${index}`);

    const seed = await this.hkdf(ikm, salt, info, 32);

    return Keypair.fromSeed(new Uint8Array(seed));
  }

  private async hkdf(
    ikm: Uint8Array,
    salt: Uint8Array,
    info: Uint8Array,
    length: number
  ): Promise<Uint8Array> {
    const saltArrayBuffer = new Uint8Array(salt).buffer;
    const ikmArrayBuffer = new Uint8Array(ikm).buffer;
    const infoArrayBuffer = new Uint8Array(info).buffer;

    const baseKey = await crypto.subtle.importKey('raw', ikmArrayBuffer, { name: 'HKDF' }, false, [
      'deriveBits'
    ]);

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: saltArrayBuffer,
        info: infoArrayBuffer
      },
      baseKey,
      length * 8
    );

    return new Uint8Array(derivedBits);
  }
}
