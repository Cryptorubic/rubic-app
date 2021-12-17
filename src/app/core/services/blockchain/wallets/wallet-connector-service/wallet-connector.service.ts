import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { AccountError } from 'src/app/core/errors/models/provider/AccountError';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { WalletError } from 'src/app/core/errors/models/provider/WalletError';
import { NotSupportedNetworkError } from 'src/app/core/errors/models/provider/NotSupportedNetwork';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { MetamaskWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/metamask-wallet-adapter';
import { WalletConnectAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/wallet-connect-adapter';
import { WalletLinkWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/wallet-link-wallet-adapter';
import { StoreService } from 'src/app/core/services/store/store.service';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { HttpService } from '@core/services/http/http.service';
import { map } from 'rxjs/operators';
import { TUI_IS_IOS } from '@taiga-ui/cdk';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { PhantomWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/solana/phantom-wallet-adapter';
import { SolflareWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/solana/solflare-wallet-adapter';
import { SignRejectError } from '@core/errors/models/provider/SignRejectError';
import { WEB3_SUPPORTED_BLOCKCHAINS } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { Connection } from '@solana/web3.js';
import { TrustWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/trust-wallet-adapter';

interface WCWallets {
  [P: string]: {
    mobile: {
      native: string;
      universal: string;
    };
    metadata: {
      shortName: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class WalletConnectorService {
  private readonly networkChangeSubject$: BehaviorSubject<IBlockchain>;

  private readonly addressChangeSubject$: BehaviorSubject<string>;

  private readonly _transactionEmitter$ = new Subject<void>();

  public readonly transactionEmitter$ = this._transactionEmitter$.asObservable();

  public providerName: WALLET_NAME;

  private privateProvider: CommonWalletAdapter;

  public get address(): string | undefined {
    return this.provider?.address;
  }

  public get network(): IBlockchain {
    return this.provider.network;
  }

  public get networkName(): BLOCKCHAIN_NAME {
    return this.provider.networkName;
  }

  public get provider(): CommonWalletAdapter {
    return this.privateProvider;
  }

  public set provider(value: CommonWalletAdapter) {
    this.privateProvider = value;
  }

  public get isProviderActive(): boolean {
    return Boolean(this.provider?.isActive);
  }

  public get isProviderInstalled(): boolean {
    return Boolean(this.provider?.isInstalled);
  }

  public get networkChange$(): Observable<IBlockchain> {
    return this.networkChangeSubject$.asObservable();
  }

  public get addressChange$(): Observable<string> {
    return this.addressChangeSubject$.asObservable();
  }

  public readonly web3: Web3;

  private _solanaWeb3connection: Connection;

  set solanaWeb3Connection(value: Connection) {
    this._solanaWeb3connection = value;
  }

  get solanaWeb3Connection(): Connection {
    return this._solanaWeb3connection;
  }

  constructor(
    private readonly storage: StoreService,
    private readonly errorService: ErrorsService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly httpService: HttpService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(TUI_IS_IOS) private readonly isIos: boolean
  ) {
    this.web3 = new Web3();
    this.networkChangeSubject$ = new BehaviorSubject<IBlockchain>(null);
    this.addressChangeSubject$ = new BehaviorSubject<string>(null);
  }

  /**
   * Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return The signature.
   */
  public async signPersonal(message: string): Promise<string> {
    try {
      return this.provider.signPersonal(message);
    } catch (err: unknown) {
      throw new SignRejectError();
    }
  }

  public emitTransaction(): void {
    this._transactionEmitter$.next();
  }

  /**
   * Setup provider based on local storage.
   */
  public async installProvider(): Promise<boolean> {
    const provider = this.storage.getItem('provider');
    if (!provider) {
      return false;
    }
    if (provider === WALLET_NAME.WALLET_LINK) {
      const chainId = this.storage.getItem('chainId');
      return this.connectProvider(provider, chainId);
    }
    return this.connectProvider(provider);
  }

  public getBlockchainsBasedOnWallet(): BLOCKCHAIN_NAME[] {
    if (this.provider.walletType === 'solana') {
      return [BLOCKCHAIN_NAME.SOLANA];
    }
    if (this.provider.walletType === 'ethLike') {
      return [...WEB3_SUPPORTED_BLOCKCHAINS];
    }
    return [];
  }

  public async activate(): Promise<void> {
    await this.provider.activate();
    this.storage.setItem('provider', this.provider.walletName);
  }

  public async requestPermissions(): Promise<{ parentCapability: string }[]> {
    return this.provider.requestPermissions();
  }

  public deActivate(): void {
    this.storage.deleteItem('provider');
    return this.provider.deActivate();
  }

  /**
   * opens a window with suggestion to add token to user's wallet
   * @param token token to add
   */
  public addToken(token: Token): Promise<void> {
    return this.provider.addToken(token);
  }

  public async connectProvider(walletName: WALLET_NAME, chainId?: number): Promise<boolean> {
    try {
      this.provider = await this.createWalletAdapter(walletName, chainId);
      return true;
    } catch (e) {
      this.errorService.catch(e);
      return false;
    }
  }

  private async createWalletAdapter(
    walletName: WALLET_NAME,
    chainId?: number
  ): Promise<CommonWalletAdapter> {
    const walletAdapters: Record<WALLET_NAME, () => Promise<CommonWalletAdapter>> = {
      [WALLET_NAME.SOLFLARE]: async () =>
        new SolflareWalletAdapter(
          this.networkChangeSubject$,
          this.addressChangeSubject$,
          this.errorService,
          this.solanaWeb3Connection
        ),
      [WALLET_NAME.PHANTOM]: async () =>
        new PhantomWalletAdapter(
          this.networkChangeSubject$,
          this.addressChangeSubject$,
          this.errorService,
          this.solanaWeb3Connection
        ),
      [WALLET_NAME.TRUST_WALLET]: async () =>
        new TrustWalletAdapter(
          this.web3,
          this.networkChangeSubject$,
          this.addressChangeSubject$,
          this.errorService,
          this.isIos,
          this.window,
          this.transactionEmitter$
        ),
      [WALLET_NAME.WALLET_CONNECT]: async () =>
        new WalletConnectAdapter(
          this.web3,
          this.networkChangeSubject$,
          this.addressChangeSubject$,
          this.errorService
        ),
      [WALLET_NAME.METAMASK]: async () => {
        const metamaskWalletAdapter = new MetamaskWalletAdapter(
          this.web3,
          this.networkChangeSubject$,
          this.addressChangeSubject$,
          this.errorService
        );
        await metamaskWalletAdapter.setupDefaultValues();
        return metamaskWalletAdapter as CommonWalletAdapter;
      },
      [WALLET_NAME.WALLET_LINK]: async () =>
        new WalletLinkWalletAdapter(
          this.web3,
          this.networkChangeSubject$,
          this.addressChangeSubject$,
          this.errorService,
          this.storage,
          chainId
        )
    };
    return walletAdapters[walletName]();
  }

  public async connectDefaultProvider(): Promise<void> {
    this.provider = new MetamaskWalletAdapter(
      this.web3,
      this.networkChangeSubject$,
      this.addressChangeSubject$,
      this.errorService
    );
    this.providerName = WALLET_NAME.METAMASK;
  }

  public checkSettings(selectedBlockchain: BLOCKCHAIN_NAME): void {
    if (!this.isProviderActive) {
      throw new WalletError();
    }
    if (!this.address) {
      throw new AccountError();
    }

    const isTestingMode = this.useTestingModeService.isTestingMode.getValue();
    if (
      this.networkName !== selectedBlockchain &&
      (!isTestingMode || this.networkName !== `${selectedBlockchain}_TESTNET`)
    ) {
      if (this.providerName === WALLET_NAME.METAMASK) {
        throw new NetworkError(selectedBlockchain);
      } else if (!this.provider.isMultiChainWallet) {
        throw new NotSupportedNetworkError(selectedBlockchain);
      }
    }
  }

  public async addChain(networkName: BLOCKCHAIN_NAME): Promise<void> {
    const network = BlockchainsInfo.getBlockchainByName(networkName);
    const defaultData = {
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        name: 'Binance Smart Chain Mainnet',
        rpc: 'https://bsc-dataseed1.binance.org'
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        name: 'Polygon Mainnet',
        rpc: 'https://polygon-rpc.com/'
      },
      [BLOCKCHAIN_NAME.HARMONY]: {
        name: 'Harmony Mainnet Shard 0',
        rpc: 'https://api.harmony.one'
      },
      [BLOCKCHAIN_NAME.AVALANCHE]: {
        name: 'Avalanche Mainnet',
        rpc: 'https://api.avax.network/ext/bc/C/rpc'
      },
      [BLOCKCHAIN_NAME.MOONRIVER]: {
        name: 'Moonriver',
        rpc: 'https://rpc.moonriver.moonbeam.network'
      },
      [BLOCKCHAIN_NAME.FANTOM]: {
        name: 'Fantom Opera',
        rpc: 'https://rpc.ftm.tools'
      }
    };
    const params = {
      chainId: `0x${network.id.toString(16)}`,
      chainName: defaultData[network.name as keyof typeof defaultData]?.name || network.name,
      nativeCurrency: {
        name: network.nativeCoin.name,
        symbol: network.nativeCoin.symbol,
        decimals: 18
      },
      rpcUrls: [defaultData[network.name as keyof typeof defaultData]?.rpc || network.rpcLink],
      blockExplorerUrls: [network.scannerUrl],
      iconUrls: [`${this.window.location.origin}/${network.imagePath}`]
    } as AddEthChainParams;
    await this.provider.addChain(params);
  }

  /**
   * Prompts the user to switch the network, or add it to the wallet if the network has not been added yet.
   * @param networkName chain to switch to.
   * @return was the network switch successful.
   */
  public async switchChain(networkName: BLOCKCHAIN_NAME): Promise<boolean> {
    const network = BlockchainsInfo.getBlockchainByName(networkName);
    const chainId = `0x${network.id.toString(16)}`;
    try {
      await this.provider.switchChain(chainId);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await this.addChain(networkName);
          await this.provider.switchChain(chainId);
          return true;
        } catch (err) {
          this.errorService.catch(err);
          return false;
        }
      } else {
        this.errorService.catch(switchError);
        return false;
      }
    }
  }

  /**
   * Fetches wallets from WC API, filters by black list and takes names.
   * @return Observable<string[]> List of wallets names.
   */
  private getWalletConnectWallets(): Observable<string[]> {
    const url = 'https://registry.walletconnect.org/data/wallets.json';
    const blackListWallets = ['trust'];
    return this.httpService.get<WCWallets>(null, null, url).pipe(
      map(registry => {
        const mobileWallets = Object.values(registry).filter(el => el.mobile?.native);
        const allowMobileWallets = mobileWallets.filter(
          el => !blackListWallets.includes(el.metadata.shortName.toLowerCase())
        );
        return allowMobileWallets.map(el => el.metadata.shortName);
      })
    );
  }
}
