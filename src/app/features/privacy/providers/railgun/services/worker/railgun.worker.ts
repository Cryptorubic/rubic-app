/// <reference lib="webworker" />
import './worker-polyfill';
import { ArtifactStoreService } from '@features/privacy/providers/railgun/services/worker/artifact-store.service';
import { BroadcasterService } from '@features/privacy/providers/railgun/services/worker/broadcaster.service';
import { EncryptionService } from '@features/privacy/providers/railgun/services/worker/encryption.service';
import { LevelDownService } from '@features/privacy/providers/railgun/services/worker/level-down.service';
import { ProofService } from '@features/privacy/providers/railgun/services/worker/proof.service';
import { RailgunEngineService } from '@features/privacy/providers/railgun/services/worker/railgun-engine.service';
import { MnemonicService } from '@features/privacy/providers/railgun/services/worker/mnemonic.service';
import { BalanceControllerService } from '@features/privacy/providers/railgun/services/worker/balance-controller.service';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { RailgunRequest } from '@features/privacy/providers/railgun/services/worker/models';
import { postWorkerMessage } from '@features/privacy/providers/railgun/services/worker/utils';
import { Chain } from '@railgun-community/shared-models';

export class RailgunAdapter {
  public readonly artifactService = new ArtifactStoreService();

  public readonly broadcasterService = new BroadcasterService();

  public readonly encryptionService = new EncryptionService();

  public readonly dbService = new LevelDownService();

  public readonly proofService = new ProofService();

  public readonly engineService = new RailgunEngineService();

  public readonly mnemonicService = new MnemonicService();

  public readonly balanceControllerService = new BalanceControllerService();

  public async initServices(): Promise<void> {
    const db = this.dbService.createIndexDB();
    const artifactStore = this.artifactService.createArtifactStore();
    await this.engineService.start({ db, artifactStore });

    this.balanceControllerService.installCallbacks();
    await this.engineService.loadEngineProvider();
    await this.proofService.initProver();
  }
}

let adapter: RailgunAdapter;

addEventListener('message', ({ data }: { data: RailgunRequest<unknown> }) => {
  switch (data.method) {
    case 'init': {
      adapter = new RailgunAdapter();
      adapter.initServices().then(() => {
        postWorkerMessage({ method: 'initialized', response: null });
      });
      break;
    }
    case 'setupFromPassword': {
      const account = data.params as string;
      adapter.encryptionService.setupFromPassword(account).then(response => {
        postWorkerMessage({ method: 'setupFromPassword', response });
      });
      break;
    }
    case 'createPrivateWallet': {
      const { phrase, blockchain, encryptionKey } = data.params as {
        phrase: string;
        blockchain: PrivacySupportedNetworks;
        encryptionKey: string;
      };
      adapter.mnemonicService
        .createPrivateWallet(phrase, blockchain, encryptionKey)
        .then(response => {
          postWorkerMessage({ method: 'createPrivateWallet', response });
        });
      break;
    }
    case 'refreshBalances': {
      const { chain, walletIds } = data.params as { chain: Chain; walletIds: string[] };
      adapter.balanceControllerService.refreshBalances(chain, walletIds);
      break;
    }
  }
});
