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
import { RailgunRequest } from '@features/privacy/providers/railgun/services/worker/models';
import { postWorkerMessage } from '@features/privacy/providers/railgun/services/worker/utils';
import {
  gasEstimateForShield,
  gasEstimateForShieldBaseToken,
  gasEstimateForUnprovenTransfer,
  gasEstimateForUnprovenUnshield,
  generateTransferProof,
  generateUnshieldProof,
  populateProvedTransfer,
  populateProvedUnshield,
  populateShield,
  populateShieldBaseToken
} from '@railgun-community/wallet';
import { Wallet } from 'ethers';
import {
  CreatePrivateWalletRequest,
  GasEstimateForShieldNativeRequest,
  GasEstimateForShieldRequest,
  GasEstimateForTransferRequest,
  GasEstimateForUnshieldRequest,
  GeneratePOIRequest,
  GenerateTransferProofRequest,
  GenerateUnshieldProofRequest,
  LoadWalletRequest,
  PopulateShieldNativeRequest,
  PopulateShieldRequest,
  PopulateTransferRequest,
  PopulateUnshieldRequest,
  RefreshBalancesRequest,
  SetupFromPasswordRequest,
  UnlockFromPasswordRequest,
  WalletCredentialsRequest
} from '@features/privacy/providers/railgun/models/worker-types';
import { generatePOIsForWallet } from '@railgun-community/wallet';

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
  const { id, method, params } = data;

  try {
    switch (method) {
      case 'init': {
        adapter = new RailgunAdapter();
        await adapter.initServices();
        postWorkerMessage({ id, method: 'initialized', response: null });
        break;
      }

      case 'setupFromPassword': {
        const password = params as SetupFromPasswordRequest;
        const encryptionKeys = await adapter.encryptionService.setupFromPassword(password);
        postWorkerMessage({ id, method, response: encryptionKeys });
        break;
      }

      case 'unlockFromPassword': {
        const { password } = params as UnlockFromPasswordRequest;
        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        postWorkerMessage({ id, method, response: encryptionKey });
        break;
      }

      case 'createPrivateWallet': {
        const { phrase, blockchain, encryptionKey } = params as CreatePrivateWalletRequest;
        const wallet = await adapter.mnemonicService.createPrivateWallet(
          phrase,
          blockchain,
          encryptionKey
        );
        postWorkerMessage({ id, method, response: wallet });
        break;
      }

      case 'loadWallet': {
        const { password, railgunId } = params as LoadWalletRequest;
        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const wallet = await adapter.mnemonicService.loadWallet(railgunId, encryptionKey);
        postWorkerMessage({ id, method, response: wallet });
        break;
      }

      case 'getMnemonic': {
        const { password, walletId } = params as WalletCredentialsRequest;
        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const mnemonic = await adapter.mnemonicService.getLastMnemonic(encryptionKey, walletId);
        postWorkerMessage({ id, method, response: mnemonic });
        break;
      }

      case 'getEvmWallet': {
        const { password, walletId } = params as WalletCredentialsRequest;
        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const mnemonic = await adapter.mnemonicService.getLastMnemonic(encryptionKey, walletId);
        const evmWallet = Wallet.fromPhrase(mnemonic).address;
        postWorkerMessage({ id, method, response: evmWallet });
        break;
      }

      case 'refreshBalances': {
        const { chain, walletIds } = params as RefreshBalancesRequest;
        await adapter.balanceControllerService.refreshBalances(chain, walletIds);
        break;
      }

      case 'gasEstimateForShield': {
        const { txIdVersion, network, shieldPrivateKey, erc20AmountRecipients, fromWalletAddress } =
          params as GasEstimateForShieldRequest;

        const estimates = await gasEstimateForShield(
          txIdVersion,
          network,
          shieldPrivateKey,
          erc20AmountRecipients,
          [],
          fromWalletAddress
        );
        postWorkerMessage({ id, method, response: estimates });
        break;
      }

      case 'gasEstimateForShieldNative': {
        const {
          txIdVersion,
          network,
          shieldPrivateKey,
          erc20AmountRecipients,
          railgunAddress,
          fromWalletAddress
        } = params as GasEstimateForShieldNativeRequest;

        const estimates = await gasEstimateForShieldBaseToken(
          txIdVersion,
          network,
          railgunAddress,
          shieldPrivateKey,
          erc20AmountRecipients[0],
          fromWalletAddress
        );
        postWorkerMessage({ id, method, response: estimates });
        break;
      }

      case 'populateShield': {
        const { txIdVersion, network, shieldPrivateKey, erc20AmountRecipients, gasDetails } =
          params as PopulateShieldRequest;

        const { transaction, nullifiers } = await populateShield(
          txIdVersion,
          network,
          shieldPrivateKey,
          erc20AmountRecipients,
          [],
          gasDetails
        );
        postWorkerMessage({ id, method, response: { transaction, nullifiers } });
        break;
      }

      case 'populateShieldNative': {
        const {
          txIdVersion,
          network,
          shieldPrivateKey,
          erc20AmountRecipients,
          railgunAddress,
          gasDetails
        } = params as PopulateShieldNativeRequest;

        const { transaction, nullifiers } = await populateShieldBaseToken(
          txIdVersion,
          network,
          railgunAddress,
          shieldPrivateKey,
          erc20AmountRecipients[0],
          gasDetails
        );
        postWorkerMessage({ id, method, response: { transaction, nullifiers } });
        break;
      }

      case 'gasEstimateForUnshield': {
        const { txIdVersion, network, walletId, password, gasDetails, erc20AmountRecipients } =
          params as GasEstimateForUnshieldRequest;

        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const estimates = await gasEstimateForUnprovenUnshield(
          txIdVersion,
          network,
          walletId,
          encryptionKey,
          erc20AmountRecipients,
          [],
          gasDetails,
          undefined,
          true
        );
        postWorkerMessage({ id, method, response: estimates });
        break;
      }

      case 'generateUnshieldProof': {
        const { txIdVersion, network, walletId, password, erc20AmountRecipients } =
          params as GenerateUnshieldProofRequest;

        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const estimates = await generateUnshieldProof(
          txIdVersion,
          network,
          walletId,
          encryptionKey,
          erc20AmountRecipients,
          [],
          undefined,
          true,
          1n,
          progress => {
            postWorkerMessage({
              id,
              method: 'generateUnshieldProofProgress',
              response: progress
            });
          }
        );
        postWorkerMessage({ id, method, response: estimates });
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
        } = params as PopulateUnshieldRequest;

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
        postWorkerMessage({ id, method, response: { transaction, nullifiers } });
        break;
      }

      case 'gasEstimateForTransfer': {
        const { txIdVersion, network, walletId, password, gasDetails, erc20AmountRecipients } =
          params as GasEstimateForTransferRequest;

        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const estimates = await gasEstimateForUnprovenTransfer(
          txIdVersion,
          network,
          walletId,
          encryptionKey,
          undefined,
          erc20AmountRecipients,
          [],
          gasDetails,
          undefined,
          true
        );
        postWorkerMessage({ id, method, response: estimates });
        break;
      }

      case 'generateTransferProof': {
        const { txIdVersion, network, walletId, password, erc20AmountRecipients } =
          params as GenerateTransferProofRequest;

        const encryptionKey = await adapter.encryptionService.unlockFromPassword(password);
        const estimates = await generateTransferProof(
          txIdVersion,
          network,
          walletId,
          encryptionKey,
          false,
          undefined,
          erc20AmountRecipients,
          [],
          undefined,
          true,
          1n,
          progress => {
            postWorkerMessage({
              id,
              method: 'generateTransferProofProgress',
              response: progress
            });
          }
        );
        postWorkerMessage({ id, method, response: estimates });
        break;
      }

      case 'populateTransfer': {
        const {
          txIdVersion,
          network,
          walletId,
          erc20AmountRecipients,
          gasDetails,
          overallBatchMinGasPrice
        } = params as PopulateTransferRequest;

        const { transaction, nullifiers } = await populateProvedTransfer(
          txIdVersion,
          network,
          walletId,
          false,
          undefined,
          erc20AmountRecipients,
          [],
          undefined,
          true,
          overallBatchMinGasPrice,
          gasDetails
        );
        postWorkerMessage({ id, method, response: { transaction, nullifiers } });
        break;
      }

      case 'generatePOI': {
        const { network, walletId } = params as GeneratePOIRequest;

        await generatePOIsForWallet(network, walletId);
        postWorkerMessage({ id, method, response: {} });
        break;
      }
    }
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    postWorkerMessage({
      id,
      method: data.method,
      error: message
    });
  }
});
