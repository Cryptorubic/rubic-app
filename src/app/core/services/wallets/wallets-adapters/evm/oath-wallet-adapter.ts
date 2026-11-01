import { BehaviorSubject } from 'rxjs';
import { NgZone } from '@angular/core';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from './common/evm-wallet-adapter';
import { OathConnectionService } from '../../oath-connection.service';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { blockchainId } from '@cryptorubic/core';
import { OATH_BLOCKCHAINS, OATH_CHAIN_IDS } from '../../constants/oath-wallet';
import { AddEvmChainParams } from '../../models/add-evm-chain-params';

// Reuse one client per isolated namespace instead of accumulating relay listeners on retry.
type OathProvider = Awaited<ReturnType<typeof EthereumProvider.init>>;

let providerPromise: Promise<OathProvider> | undefined;
let teardown = Promise.resolve();

export function getOathProvider(): Promise<OathProvider> {
  if (!providerPromise) {
    providerPromise = EthereumProvider.init({
      projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
      chains: [1],
      optionalChains: OATH_CHAIN_IDS.filter(id => id !== 1),
      showQrModal: false,
      logger: 'silent',
      telemetryEnabled: false,
      rpcMap: Object.fromEntries(
        OATH_BLOCKCHAINS.map(chain => [blockchainId[chain], rpcList[chain][0]])
      ),
      customStoragePrefix: 'rubic-oath',
      storageOptions: { database: 'rubic-oath-walletconnect' },
      metadata: {
        name: 'Rubic',
        description: 'Cross-chain swaps on Rubic',
        url: 'https://app.rubic.exchange',
        icons: ['https://app.rubic.exchange/favicon.ico']
      }
    }).catch(error => {
      providerPromise = undefined;
      throw error;
    });
  }
  return providerPromise;
}

export class OathWalletAdapter extends EvmWalletAdapter<OathProvider> {
  public readonly walletName = WALLET_NAME.OATH;
  private activating = false;
  private pendingEnable: Promise<string[]> | undefined;

  constructor(
    addressChanges: BehaviorSubject<string>,
    networkChanges: BehaviorSubject<BlockchainName | null>,
    errors: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly connection: OathConnectionService,
    private readonly providerFactory = getOathProvider
  ) {
    super(addressChanges, networkChanges, errors, zone, window);
  }

  public async activate(): Promise<void> {
    if (this.activating) throw new WalletlinkError();
    this.activating = true;
    const attempt = this.connection.attempt;
    let onAbort: () => void;
    const cancelled = new Promise<never>((_, reject) => {
      onAbort = () => reject(new WalletlinkError());
      if (attempt?.signal.aborted) onAbort();
      else attempt?.signal.addEventListener('abort', onAbort, { once: true });
    });
    const onUri = (uri: string) => {
      if (!attempt) return;
      if (attempt.signal.aborted) {
        this.expireProposals();
        return;
      }
      void this.connection.showUri(attempt, uri).catch(() => attempt.cancel());
    };
    try {
      await Promise.race([teardown, cancelled]);
      this.wallet = await Promise.race([this.providerFactory(), cancelled]);
      // Startup restoration may reuse an approved session, but must never start hidden pairing.
      if (!this.wallet.session && !attempt) throw new WalletlinkError();
      if (attempt?.signal.aborted) throw new WalletlinkError();
      this.wallet.on('display_uri', onUri);
      this.pendingEnable = this.wallet.enable();
      const [address] = await Promise.race([this.pendingEnable, cancelled]);
      const chainId = Number(this.wallet.chainId);
      if (!address || !OATH_CHAIN_IDS.includes(chainId) || attempt?.signal.aborted) {
        throw new WalletlinkError();
      }
      this.selectedAddress = address;
      this.selectedChain = BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName;
      this.isEnabled = true;
      this.initSubscriptionsOnChanges();
      this.zone.run(() => {
        this.onAddressChanges$.next(address);
        this.onNetworkChanges$.next(this.selectedChain);
      });
    } catch {
      // Release the guide promptly. The next activation waits for complete cleanup.
      void this.deactivate();
      const error = new WalletlinkError();
      // Closing the guide is an expected user cancellation, not a connection error notification.
      if (attempt?.signal.aborted) error.displayError = false;
      throw error;
    } finally {
      const wallet = this.wallet;
      // Keep the cancellation listener until a delayed proposal has settled. A retry
      // waits on teardown, so an old approval cannot overwrite its session.
      if (this.pendingEnable) {
        void this.pendingEnable
          .then(
            (): void => {},
            (): void => {}
          )
          .then(() => {
            wallet?.removeListener('display_uri', onUri);
          });
      } else wallet?.removeListener('display_uri', onUri);
      attempt?.signal.removeEventListener('abort', onAbort);
      this.activating = false;
    }
  }

  public async deactivate(): Promise<void> {
    super.deactivate();
    const wallet = this.wallet;
    if (!wallet) return;
    const pendingEnable = this.pendingEnable;
    teardown = teardown
      .then(async () => {
        this.expireProposals();
        // In SDK 2.26 abortPairingAttempt is a no-op. Expiring each proposal rejects
        // its approval promise; display_uri also expires a proposal created after cancel.
        await pendingEnable?.catch((): void => {});
        if (wallet.session) await wallet.disconnect();
        for (const pairing of wallet.signer.client.pairing.getAll()) {
          await wallet.signer.client.disconnect({
            topic: pairing.topic,
            reason: { code: 6000, message: 'User disconnected' }
          });
        }
      })
      .catch(() => {
        // Keep retries possible; never send a provider error containing pairing secrets to logs.
        this.errorsService.catch(new WalletlinkError());
      });
    await teardown;
  }

  private expireProposals(): void {
    const client = this.wallet?.signer.client;
    client?.proposal.getAll().forEach(proposal => client.core.expirer.set(proposal.id, 0));
  }

  public override async switchChain(chainId: string): Promise<void> {
    this.requireSupportedChain(chainId);
    return super.switchChain(chainId);
  }

  public override async addChain(params: AddEvmChainParams): Promise<void> {
    this.requireSupportedChain(params.chainId);
    return super.addChain(params);
  }

  private requireSupportedChain(chainId: string): void {
    if (!OATH_CHAIN_IDS.includes(Number(chainId))) {
      throw new Error('This network is not supported by the Oath Wallet connection.');
    }
  }
}
