import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import Web3 from 'web3';
import { MetamaskProvider } from '../private-provider/metamask-provider/metamask-provider';
import { WalletConnectProvider } from '../private-provider/wallet-connect/wallet-connect-provider';
import { WalletLinkProvider } from '../private-provider/wallet-link/wallet-link-provider';
import { StoreService } from '../../store/store.service';
import { WALLET_NAME } from '../../../header/components/header/components/wallets-modal/models/providers';
import { ErrorsService } from '../../errors/errors.service';
import { PrivateProvider } from '../private-provider/private-provider';

@Injectable({
  providedIn: 'root'
})
export class ProviderConnectorService {
  private readonly $networkChangeSubject: BehaviorSubject<IBlockchain>;

  private readonly $addressChangeSubject: BehaviorSubject<string>;

  public providerName: WALLET_NAME;

  private privateProvider: PrivateProvider;

  public get address(): string {
    return this.provider.address;
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

  public readonly web3: Web3;

  constructor(
    private readonly storage: StoreService,
    private readonly errorsService: ErrorsService
  ) {
    this.web3 = new Web3();
    this.$networkChangeSubject = new BehaviorSubject<IBlockchain>(null);
    this.$addressChangeSubject = new BehaviorSubject<string>(null);
  }

  /**
   * @description Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return The signature.
   */
  public async signPersonal(message) {
    return this.web3.eth.personal.sign(message, this.provider.getAddress(), undefined);
  }

  /**
   * Setup provider based on local storage.
   */
  public async installProvider(): Promise<void> {
    const provider = this.storage.getItem('provider') as WALLET_NAME;
    if (provider) {
      this.connectProvider(provider);
    }
  }

  public async activate(): Promise<void> {
    await this.provider.activate();
    this.storage.setItem('provider', this.provider.name);
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

  public connectProvider(provider: WALLET_NAME, chainId?: number) {
    switch (provider) {
      case WALLET_NAME.WALLET_LINK: {
        this.provider = new WalletLinkProvider(
          this.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject,
          this.errorsService,
          chainId
        );
        break;
      }
      case WALLET_NAME.METAMASK: {
        this.provider = new MetamaskProvider(
          this.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject,
          this.errorsService
        );
        break;
      }
      case WALLET_NAME.WALLET_CONNECT: {
        this.provider = new WalletConnectProvider(
          this.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject,
          this.errorsService
        );
        break;
      }
      default: {
        this.provider = new MetamaskProvider(
          this.web3,
          this.$networkChangeSubject,
          this.$addressChangeSubject,
          this.errorsService
        );
      }
    }
    this.providerName = provider;
  }
}
