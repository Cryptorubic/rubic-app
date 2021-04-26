import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { MetamaskProvider } from '../private-provider/metamask-provider/metamask-provider';
import { Web3PrivateService } from '../web3-private-service/web3-private.service';

@Injectable({
  providedIn: 'root'
})
export class ProviderConnectorService {
  private $networkChangeSubject: BehaviorSubject<IBlockchain>;

  private $addressChangeSubject: BehaviorSubject<string>;

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

  public async activate(): Promise<void> {
    return this.provider.activate();
  }

  public deActivate(): void {
    return this.provider.deActivate();
  }

  public get $networkChange(): Observable<IBlockchain> {
    return this.$networkChangeSubject.asObservable();
  }

  public get $addressChange(): Observable<string> {
    return this.$addressChangeSubject.asObservable();
  }

  constructor(private readonly web3private: Web3PrivateService) {
    this.$networkChangeSubject = new BehaviorSubject<IBlockchain>(null);
    this.$addressChangeSubject = new BehaviorSubject<string>(null);
    this.provider = new MetamaskProvider(
      this.web3private.web3,
      this.$networkChangeSubject,
      this.$addressChangeSubject
    );
  }

  /**
   * @description opens a window with suggestion to add token to user's wallet
   * @param token token to add
   */
  public addToken(token: SwapToken): Promise<void> {
    return this.provider.addToken(token);
  }
}
