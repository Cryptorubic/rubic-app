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
import {
  Chain,
  NetworkName,
  RailgunERC20AmountRecipient,
  TransactionGasDetails,
  TXIDVersion
} from '@railgun-community/shared-models';
import {
  gasEstimateForShield,
  gasEstimateForUnprovenUnshield,
  generateUnshieldProof,
  populateProvedUnshield,
  populateShield
} from '@railgun-community/wallet';

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

addEventListener('message', async ({ data }: { data: RailgunRequest<unknown> }) => {
  switch (data.method) {
    case 'init': {
      adapter = new RailgunAdapter();
      await adapter.initServices();
      postWorkerMessage({ method: 'initialized', response: null });
      break;
    }
    case 'setupFromPassword': {
      const account = data.params as string;
      const encryptionKeys = await adapter.encryptionService.setupFromPassword(account);
      postWorkerMessage({ method: 'setupFromPassword', response: encryptionKeys });
      break;
    }
    case 'createPrivateWallet': {
      const { phrase, blockchain, encryptionKey } = data.params as {
        phrase: string;
        blockchain: PrivacySupportedNetworks;
        encryptionKey: string;
      };
      const wallet = await adapter.mnemonicService.createPrivateWallet(
        phrase,
        blockchain,
        encryptionKey
      );
      postWorkerMessage({ method: 'createPrivateWallet', response: wallet });
      break;
    }
    case 'refreshBalances': {
      const { chain, walletIds } = data.params as { chain: Chain; walletIds: string[] };
      await adapter.balanceControllerService.refreshBalances(chain, walletIds);
      break;
    }
    case 'getMnemonic': {
      const { password, walletId } = data.params as { walletId: string; password: string };
      const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
      const mnemonic = await adapter.mnemonicService.getLastMnemonic(encryptionKey, walletId);
      postWorkerMessage({
        method: 'getMnemonic',
        response: mnemonic
      });
      break;
    }
    case 'gasEstimateForShield': {
      const {
        txIdVersion,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients,
        fromWalletAddress
      } = data.params as {
        txIdVersion: TXIDVersion;
        network: NetworkName;
        shieldPrivateKey: string;
        erc20AmountRecipients: RailgunERC20AmountRecipient[];
        nftAmountRecipients: []; // nftAmountRecipients
        fromWalletAddress: string;
      };
      const esimates = await gasEstimateForShield(
        txIdVersion,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients,
        fromWalletAddress
      );

      postWorkerMessage({ method: 'gasEstimateForShield', response: esimates });
      break;
    }
    case 'populateShield': {
      const {
        txIdVersion,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients,
        gasDetails
      } = data.params as {
        txIdVersion: TXIDVersion;
        network: NetworkName;
        shieldPrivateKey: string;
        erc20AmountRecipients: RailgunERC20AmountRecipient[];
        nftAmountRecipients: []; // nftAmountRecipients
        gasDetails: TransactionGasDetails;
      };
      const { transaction, nullifiers } = await populateShield(
        txIdVersion,
        network,
        shieldPrivateKey,
        erc20AmountRecipients,
        nftAmountRecipients,
        gasDetails
      );
      postWorkerMessage({
        method: 'populateShield',
        response: { transaction, nullifiers }
      });
      break;
    }
    case 'gasEstimateForUnshield': {
      const { txIdVersion, network, walletId, password, gasDetails, erc20AmountRecipients } =
        data.params as {
          txIdVersion: TXIDVersion;
          network: NetworkName;
          walletId: string;
          password: string;
          gasDetails: TransactionGasDetails;
          erc20AmountRecipients: RailgunERC20AmountRecipient[];
        };
      const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
      const esimates = await gasEstimateForUnprovenUnshield(
        txIdVersion,
        network,
        walletId,
        encryptionKey,
        erc20AmountRecipients,
        [], // nft amount recipients
        gasDetails,
        undefined,
        true
      );

      postWorkerMessage({ method: 'gasEstimateForUnshield', response: esimates });
      break;
    }
    case 'generateUnshieldProof': {
      const { txIdVersion, network, walletId, password, erc20AmountRecipients } = data.params as {
        txIdVersion: TXIDVersion;
        network: NetworkName;
        walletId: string;
        password: string;
        erc20AmountRecipients: RailgunERC20AmountRecipient[];
      };

      const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
      const esimates = await generateUnshieldProof(
        txIdVersion,
        network,
        walletId,
        encryptionKey,
        erc20AmountRecipients,
        [], // nft amount recipients
        undefined,
        true,
        1n,
        progress => {
          postWorkerMessage({
            method: 'generateUnshieldProofProgress',
            response: progress
          });
        }
      );

      postWorkerMessage({ method: 'generateUnshieldProof', response: esimates });
      break;
    }
    case 'populateUnshield': {
      const {
        txIdVersion,
        network,
        walletId,
        erc20AmountRecipients,
        gasDetails,
        overallBatchMinGasPrice
      } = data.params as {
        txIdVersion: TXIDVersion;
        network: NetworkName;
        walletId: string;
        erc20AmountRecipients: RailgunERC20AmountRecipient[];
        gasDetails: TransactionGasDetails;
        overallBatchMinGasPrice: bigint;
      };
      const { transaction, nullifiers } = await populateProvedUnshield(
        txIdVersion,
        network,
        walletId,
        erc20AmountRecipients,
        [],
        undefined,
        true,
        overallBatchMinGasPrice,
        gasDetails
      );
      postWorkerMessage({
        method: 'populateUnshield',
        response: { transaction, nullifiers }
      });
      break;
    }
    case 'unlockFromPassword': {
      const { password } = data.params as { password: string };
      const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
      postWorkerMessage({
        method: 'unlockFromPassword',
        response: encryptionKey
      });
      break;
    }
    case 'loadWallet': {
      const { password, railgunId } = data.params as { password: string; railgunId: string };
      const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
      const wallet = await adapter.mnemonicService.loadWallet(railgunId, encryptionKey);

      postWorkerMessage({
        method: 'loadWallet',
        response: wallet
      });
      break;
    }
  }
});
