import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import { Hinkal, prepareHinkalWithSignature, UserKeys } from '@hinkal/common';
import { BehaviorSubject } from 'rxjs';
import { HinkalWorkerService } from './hinkal-worker.service';
import { ErrorsService } from '@app/core/errors/errors.service';
import { InitParams } from './workers/models/worker-params';

@Injectable()
export class HinkalInstanceService {
  private readonly _hinkalInstance: Hinkal<unknown>;

  public get hinkalInstance(): Hinkal<unknown> {
    return this._hinkalInstance;
  }

  private readonly _currSignature$ = new BehaviorSubject<string | null>(null);

  public readonly currSignature$ = this._currSignature$.asObservable();

  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly workerService: HinkalWorkerService,
    private readonly errorsService: ErrorsService
  ) {
    this._hinkalInstance = new Hinkal({
      generateProofRemotely: true,
      disableCaching: true
    });
  }

  public resetInstance(): void {
    this._hinkalInstance.userKeys = new UserKeys();
    this._currSignature$.next(null);
  }

  public async updateInstance(
    address: string | null,
    blockchain: EvmBlockchainName
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

      const params: InitParams = {
        chainId: blockchainId[blockchain],
        address,
        signature
      };

      this.workerService.request({
        params,
        type: 'init'
      });

      return true;
    } catch (err) {
      console.error('FAILED TO UPDATE HINKAL INSTANCE', err);
      this.errorsService.catch(err);
      return false;
    }
  }
}
