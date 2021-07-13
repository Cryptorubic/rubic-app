import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { MetamaskError } from 'src/app/core/errors/models/provider/MetamaskError';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { PrivateProvider } from '../private-provider';

import { BlockchainsInfo } from '../../blockchain-info';
import { WALLET_NAME } from '../../../../header/components/header/components/wallets-modal/models/providers';

export class MetamaskProvider extends PrivateProvider {
  private isEnabled = false;

  private readonly core: any;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this.core;
  }

  get isActive(): boolean {
    return this.isEnabled && !!this.selectedAddress;
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.METAMASK;
  }

  constructor(
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>,
    errorsService: ErrorsService
  ) {
    super(errorsService);
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;

    const { ethereum } = window;
    if (!ethereum) {
      throw new MetamaskError();
    }
    web3.setProvider(ethereum);
    this.core = ethereum;
    this.core.on('chainChanged', (chain: string) => {
      this.selectedChain = chain;
      if (this.isEnabled) {
        chainChange.next(BlockchainsInfo.getBlockchainById(chain));
        // tslint:disable-next-line:no-console
        console.info('Chain changed', chain);
      }
    });
    this.core.on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.onAddressChanges.next(this.selectedAddress);
        // tslint:disable-next-line:no-console
        console.info('Selected account changed to', accounts[0]);
      }
      if (!this.selectedAddress) {
        this.selectedChain = null;
        this.deActivate();
      }
    });
  }

  public async setupDefaultValues(): Promise<void> {
    const chain = await this.core.request({ method: 'eth_chainId' });
    const accounts = await this.core.request({ method: 'eth_accounts' });
    this.selectedChain = chain;
    [this.selectedAddress] = accounts;
  }

  public getAddress(): string {
    if (this.isEnabled) {
      return this.selectedAddress;
    }
    return null;
  }

  public getNetwork(): IBlockchain {
    if (this.isEnabled) {
      return this.selectedChain ? BlockchainsInfo.getBlockchainById(this.selectedChain) : undefined;
    }
    return null;
  }

  public async activate(params?: unknown[]): Promise<void> {
    try {
      const accounts = await this.core.request({
        method: 'eth_requestAccounts',
        params
      });
      const chain = await this.core.request({ method: 'eth_chainId' });
      this.isEnabled = true;
      this.selectedChain = String(chain);
      [this.selectedAddress] = accounts;
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(this.selectedAddress);
    } catch (error) {
      throw new MetamaskError();
    }
  }

  public async requestPermissions(): Promise<unknown[]> {
    try {
      return this.core.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  public deActivate(): void {
    this.onAddressChanges.next(null);
    this.onNetworkChanges.next(null);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new MetamaskError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    return this.core.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image
        }
      }
    });
  }

  public async switchChain(chainId: string): Promise<null | never> {
    return this.core.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEthChainParams): Promise<null | never> {
    return this.core.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
