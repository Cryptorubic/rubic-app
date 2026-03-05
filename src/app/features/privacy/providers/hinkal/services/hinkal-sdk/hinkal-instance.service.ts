import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import { Hinkal, prepareHinkalWithSignature, UserKeys } from '@hinkal/common';

@Injectable()
export class HinkalInstanceService {
  private readonly hinkalSigningMessage = 'Login to Hinkal Protocol';

  private readonly _hinkalInstance: Hinkal<unknown>;

  public get hinkalInstance(): Hinkal<unknown> {
    return this._hinkalInstance;
  }

  constructor(private readonly adapterFactory: BlockchainAdapterFactoryService) {
    this._hinkalInstance = new Hinkal({
      generateProofRemotely: true,
      disableCaching: false
      // disableMerkleTreeUpdates: true
    });
  }

  public async updateInstance(
    address: string | null,
    blockchain: EvmBlockchainName
  ): Promise<void> {
    try {
      if (!address) {
        this._hinkalInstance.userKeys = new UserKeys();
        return;
      }

      const adapter = this.adapterFactory.getAdapter(blockchain);

      const signature = await adapter.signer.signMessage(this.hinkalSigningMessage);

      await prepareHinkalWithSignature(
        this._hinkalInstance,
        address,
        blockchainId[blockchain],
        signature
      );

      await this._hinkalInstance.resetMerkleTreesIfNecessary();
    } catch (err) {
      console.error('FAILED TO UPDATE HINKAL INSTANCE', err);
    }
  }
}
