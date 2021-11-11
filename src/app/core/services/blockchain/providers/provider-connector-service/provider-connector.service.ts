import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
import { MetamaskProvider } from 'src/app/core/services/blockchain/providers/private-provider/metamask-provider/metamask-provider';
import { WalletConnectProvider } from 'src/app/core/services/blockchain/providers/private-provider/wallet-connect/wallet-connect-provider';
import { WalletLinkProvider } from 'src/app/core/services/blockchain/providers/private-provider/wallet-link/wallet-link-provider';
import { StoreService } from 'src/app/core/services/store/store.service';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { PrivateProvider } from 'src/app/core/services/blockchain/providers/private-provider/private-provider';

@Injectable({
  providedIn: 'root'
})
export class ProviderConnectorService {
  private readonly $networkChangeSubject: BehaviorSubject<IBlockchain>;

  private readonly $addressChangeSubject: BehaviorSubject<string>;

  public providerName: WALLET_NAME;

  private privateProvider: PrivateProvider;

  public get address(): string | undefined {
    return this.provider?.address;
  }

  public get network(): IBlockchain {
    return this.provider.network;
  }

  public get networkName(): BLOCKCHAIN_NAME {
    return this.provider.networkName;
  }

  public get provider(): PrivateProvider {
    return this.privateProvider;
  }

  public set provider(value: PrivateProvider) {
    this.privateProvider = value;
  }

  public get isProviderActive(): boolean {
    return Boolean(this.provider?.isActive);
  }

  public get isProviderInstalled(): boolean {
    return Boolean(this.provider?.isInstalled);
  }

  public get $networkChange(): Observable<IBlockchain> {
    return this.$networkChangeSubject.asObservable();
  }

  public get $addressChange(): Observable<string> {
    return this.$addressChangeSubject.asObservable();
  }

  public readonly web3: Web3;

  constructor(
    private readonly storage: StoreService,
    private readonly errorService: ErrorsService,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.web3 = new Web3();
    this.$networkChangeSubject = new BehaviorSubject<IBlockchain>(null);
    this.$addressChangeSubject = new BehaviorSubject<string>(null);
  }

  /**
   * Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return The signature.
   */
  public async signPersonal(message: string) {
    return this.web3.eth.personal.sign(message, this.provider.address, undefined);
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

  public async activate(): Promise<void> {
    await this.provider.activate();
    this.storage.setItem('provider', this.provider.name);
    if (this.provider.name === WALLET_NAME.WALLET_LINK) {
      this.storage.setItem('chainId', this.provider.network.id);
    }
  }

  // eslint-disable-next-line
  public async requestPermissions(): Promise<any[]> {
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

  public async connectProvider(provider: WALLET_NAME, chainId?: number): Promise<boolean> {
    try {
      switch (provider) {
        case WALLET_NAME.WALLET_LINK: {
          this.provider = new WalletLinkProvider(
            this.web3,
            this.$networkChangeSubject,
            this.$addressChangeSubject,
            this.errorService,
            chainId
          );
          break;
        }
        case WALLET_NAME.WALLET_CONNECT: {
          this.provider = new WalletConnectProvider(
            this.web3,
            this.$networkChangeSubject,
            this.$addressChangeSubject,
            this.errorService
          );
          break;
        }
        case WALLET_NAME.METAMASK:
        default: {
          this.provider = new MetamaskProvider(
            this.web3,
            this.$networkChangeSubject,
            this.$addressChangeSubject,
            this.errorService
          ) as PrivateProvider;
          await (this.provider as MetamaskProvider).setupDefaultValues();
        }
      }
      this.providerName = provider;
      return true;
    } catch (e) {
      this.errorService.catch(e);
      return false;
    }
  }

  public async connectDefaultProvider(): Promise<void> {
    this.provider = new MetamaskProvider(
      this.web3,
      this.$networkChangeSubject,
      this.$addressChangeSubject,
      this.errorService
    ) as PrivateProvider;
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
      iconUrls: [`https://rubic.exchange/${network.imagePath}`]
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
}
