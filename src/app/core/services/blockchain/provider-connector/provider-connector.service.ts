import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { MetamaskProvider } from '../private-provider/metamask-provider/metamask-provider';
import { WalletConnectProvider } from '../private-provider/wallet-connect/wallet-connect-provider';
import { WalletLinkProvider } from '../private-provider/wallet-link/wallet-link-provider';
import { StoreService } from '../../store/store.service';
import { Web3PrivateService } from '../web3-private-service/web3-private.service';
import { WALLET_NAME } from '../../../header/components/header/components/wallets-modal/models/providers';

@Injectable({
  providedIn: 'root'
})
export class ProviderConnectorService {
  private readonly $networkChangeSubject: BehaviorSubject<IBlockchain>;

  private readonly $addressChangeSubject: BehaviorSubject<string>;

  private privateProvider: any;

  public get address(): string {
    return this.provider.address;
  }

  public get network(): IBlockchain {
    return this.provider.network;
  }

  public get networkName(): BLOCKCHAIN_NAME {
    return this.provider.networkName;
  }

  public get provider(): any {
    return this.privateProvider;
  }

  public set provider(value: any) {
    this.privateProvider = value;
  }

  public get isProviderActive(): boolean {
    return this.provider.isActive;
  }

  public get isProviderInstalled(): boolean {
    return this.provider.isInstalled;
  }

  public get $networkChange(): Observable<IBlockchain> {
    return this.$networkChangeSubject.asObservable();
  }

  public get $addressChange(): Observable<string> {
    return this.$addressChangeSubject.asObservable();
  }

  constructor(
    private readonly web3private: Web3PrivateService,
    private readonly storage: StoreService
  ) {
    this.$networkChangeSubject = new BehaviorSubject<IBlockchain>(null);
    this.$addressChangeSubject = new BehaviorSubject<string>(null);
    const provider = this.storage.getItem('provider') as WALLET_NAME;
    if (provider) {
      this.connectProvider(provider);
    }
  }

  public async activate(): Promise<void> {
    await this.provider.activate();
    this.storage.setItem('provider', this.provider.name);
    this.web3private.address = this.provider.getAddress();
  }

  public async requestPermissions(): Promise<any[]> {
    return this.provider.requestPermissions();
  }

  public deActivate(): void {
    this.storage.deleteItem('provider');
    return this.provider.deActivate();
  }

  /**
   * @description opens a window with suggestion to add token to user's wallet
   * @param token token to add
   */
  public addToken(token: SwapToken): Promise<void> {
    return this.provider.addToken(token);
  }

  public async connectProvider(provider: WALLET_NAME, chainId?: number) {
    switch (provider) {
      case WALLET_NAME.WALLET_LINK: {
        this.provider = new WalletLinkProvider(
          this.web3private.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject,
          chainId
        );
        break;
      }
      case WALLET_NAME.METAMASK: {
        this.provider = new MetamaskProvider(
          this.web3private.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject
        );
        break;
      }
      case WALLET_NAME.WALLET_CONNECT: {
        this.provider = new WalletConnectProvider(
          this.web3private.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject
        );
        break;
      }
      default: {
        this.provider = new MetamaskProvider(
          this.web3private.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject
        );
      }
    }
  }
}
