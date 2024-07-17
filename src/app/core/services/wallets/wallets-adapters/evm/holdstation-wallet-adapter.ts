import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { blockchainId, BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

export class HoldstationWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.HOLD_STATION;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        chains: [1],
        optionalChains: Object.values(blockchainId),
        showQrModal: true,
        qrModalOptions: {
          explorerExcludedWalletIds: 'ALL',
          explorerRecommendedWalletIds: [
            'b83a346877b71c02b8531f53485ce12bc00033eabcc1213ca3329cbc744813a5'
          ]
        }
      } as EthereumProviderOptions,
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window
    );
  }

  public async activate(): Promise<void> {
    this.setArgentStyle(10);
    this.setArgentStyle(300);
    this.setArgentStyle(1000);

    try {
      this.wallet = await EthereumProvider.init({
        ...this.providerConfig
      });

      const result = await Promise.race([
        this.wallet.enable(),
        new Promise<void>(resolve => setTimeout(() => resolve(null), 60_000))
      ]);
      if (result !== null) {
        const [address] = await this.wallet.enable();
        const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;

        this.isEnabled = true;
        this.selectedAddress = address;
        this.selectedChain =
          (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
        this.onAddressChanges$.next(address);
        this.onNetworkChanges$.next(this.selectedChain);

        this.initSubscriptionsOnChanges();
      } else {
        this.window.location.reload();
      }
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  private setArgentStyle(timeout: number): void {
    setTimeout(() => {
      try {
        const walletConnectorWrapper = this.window.document.querySelector('#walletconnect-wrapper');
        const header = walletConnectorWrapper.querySelector('.walletconnect-modal__header');

        const title = header.querySelector('p');
        if (title.innerHTML !== 'Connect the HoldStation Wallet') {
          title.innerHTML = 'Connect the HoldStation Wallet';
        } else {
          return;
        }

        const image = header.querySelector('img') as HTMLImageElement;
        image.src = `${this.window.origin}/assets/images/icons/wallets/holdstation.png`;

        const description = walletConnectorWrapper.querySelector('#walletconnect-qrcode-text');
        description.innerHTML = 'Scan QR code with the HoldStation wallet';
      } catch {}
    }, timeout);
  }
}
