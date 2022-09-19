import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { BLOCKCHAIN_NAME, CHAIN_TYPE } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { AddEthChainParams } from '@core/services/blockchain/wallets/models/add-eth-chain-params';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@shared/utils/rubic-window';

export class TronLinkAdapter extends CommonWalletAdapter {
  public readonly walletType = CHAIN_TYPE.TRON;

  public get isMultiChainWallet(): boolean {
    return false;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.TRON_LINK;
  }

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone);
    this.wallet = window.tronLink;
    // @TODO add change events
  }

  public async setupDefaultValues(): Promise<void> {
    this.selectedChain = BLOCKCHAIN_NAME.TRON; // @todo add check
    this.selectedAddress = this.wallet.tronWeb?.defaultAddress.base58;
  }

  public async activate(): Promise<void> {
    const response = await this.wallet.request({ method: 'tron_requestAccounts' });
    if (response.code !== 200) {
      if (
        response.code === 4001 ||
        response.message?.toLowerCase().includes('user rejected the request')
      ) {
        throw new SignRejectError();
      }
      throw new Error(response.message);
    }

    this.isEnabled = true;
    this.selectedAddress = this.wallet.tronWeb.defaultAddress.base58;
    this.onNetworkChanges$.next(this.getNetwork());
    this.onAddressChanges$.next(this.selectedAddress);
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  // @todo remove
  public switchChain(_chainParams: string): Promise<null> {
    return Promise.resolve(null);
  }

  // @todo remove
  public addChain(_params: AddEthChainParams): Promise<null> {
    return Promise.resolve(null);
  }
}
