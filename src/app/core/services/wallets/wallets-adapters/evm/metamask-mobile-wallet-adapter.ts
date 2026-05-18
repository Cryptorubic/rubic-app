import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletConnectAbstractAdapter } from '@core/services/wallets/wallets-adapters/evm/common/wallet-connect-abstract';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { WALLET_CONNECT_SUPPORTED_CHAINS } from '../../constants/evm-chain-ids';
import { SignRejectError } from '@app/core/errors/models/provider/sign-reject-error';

/**
 * Handles MetaMask connection on mobile browsers via WalletConnect deep link.
 * The user stays in their browser (e.g. Chrome) and approves the connection
 * inside the MetaMask app, then returns to the browser with the wallet connected.
 */
export class MetamaskMobileWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly isIos: boolean
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        showQrModal: false,
        chains: [1],
        optionalChains: WALLET_CONNECT_SUPPORTED_CHAINS
      },
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window
    );
  }

  public async activate(): Promise<void> {
    try {
      this.wallet = await EthereumProvider.init({
        ...this.providerConfig
      });

      // Must subscribe before enable() — display_uri fires during the handshake
      // @ts-ignore
      this.wallet.on('display_uri', (uri: string) => {
        const encodedUri = encodeURIComponent(uri);
        const deepLink = this.isIos
          ? `https://metamask.app.link/wc?uri=${encodedUri}`
          : `metamask://wc?uri=${encodedUri}`;
        this.window.location.href = deepLink;
      });

      const [address] = await this.wallet.enable();
      const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;

      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
      this.onAddressChanges$.next(address);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }

      throw new WalletlinkError();
    }
  }
}
