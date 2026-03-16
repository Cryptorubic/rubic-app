import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import { Hinkal, prepareHinkalWithSignature, UserKeys } from '@hinkal/common';
import { ethers } from 'ethers';
import { EthersProviderAdapter } from '@hinkal/common/providers/EthersProviderAdapter';
import { BehaviorSubject } from 'rxjs';
import { HinkalWorkerService } from './hinkal-worker.service';

@Injectable()
export class HinkalInstanceService {
  private readonly _hinkalInstance: Hinkal<unknown>;

  public get hinkalInstance(): Hinkal<unknown> {
    return this._hinkalInstance;
  }

  private readonly _currSignature$ = new BehaviorSubject<string>('');

  public readonly currSignature$ = this._currSignature$.asObservable();

  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly workerService: HinkalWorkerService
  ) {
    this._hinkalInstance = new Hinkal({
      generateProofRemotely: true,
      disableCaching: true
      // disableMerkleTreeUpdates: true
    });
  }

  public resetInstance(): void {
    this._hinkalInstance.userKeys = new UserKeys();
    this._currSignature$.next(null);
  }

  public async updateAdapter(wallet: RubicAny): Promise<void> {
    const signer = await new ethers.BrowserProvider(wallet, 'any').getSigner();

    const providerAdapter = new EthersProviderAdapter();
    providerAdapter.initSigner(signer);

    await this.hinkalInstance.initProviderAdapter(null, providerAdapter);
  }

  public async updateInstance(
    address: string | null,
    blockchain: EvmBlockchainName,
    wallet: RubicAny
  ): Promise<boolean> {
    try {
      const adapter = this.adapterFactory.getAdapter(blockchain);
      const signature = await adapter.signer.signMessage(this.hinkalInstance.signingMessage);

      await prepareHinkalWithSignature(
        this._hinkalInstance,
        address,
        blockchainId[blockchain],
        signature
      );

      this._currSignature$.next(signature);

      await this.updateAdapter(wallet);
      this.workerService.request({
        chainId: blockchainId[blockchain],
        address,
        signature,
        type: 'init'
      });

      return true;
    } catch (err) {
      console.error('FAILED TO UPDATE HINKAL INSTANCE', err);
      return false;
    }
  }
}
