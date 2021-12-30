import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import WalletLink, { WalletLinkProvider, WalletLinkProvider as CoinbaseProvider } from 'walletlink';
import { WalletLinkOptions } from 'walletlink/dist/WalletLink';
import Web3 from 'web3';
import { ErrorsService } from '@core/errors/errors.service';
import { Token } from '@shared/models/tokens/token';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { UndefinedError } from '@core/errors/models/undefined.error';
import BigNumber from 'bignumber.js';
import { RubicError } from '@core/errors/models/rubic-error';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { StoreService } from '@core/services/store/store.service';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';
import { NetworkError } from '@core/errors/models/provider/network-error';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { WalletlinkWrongNetwork } from '@core/errors/models/provider/walletlink-wrong-network';

export class WalletLinkWalletAdapter extends CommonWalletAdapter<CoinbaseProvider> {
  private isMobileMode: boolean = false;

  private defaultWalletParams: WalletLinkOptions;

  public get isMultiChainWallet(): boolean {
    return false;
  }

  get walletType(): BlockchainType {
    return 'ethLike';
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.WALLET_LINK;
  }

  constructor(
    web3: Web3,
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    onAddressChanges$: BehaviorSubject<string>,
    errorService: ErrorsService,
    private readonly storeService: StoreService,
    blockchainId?: number
  ) {
    super(errorService, onAddressChanges$, onNetworkChanges$);
    this.wallet = this.getWallet(blockchainId);
    web3.setProvider(this.wallet);
  }

  public getWallet(blockchainId?: number): CoinbaseProvider {
    const provider = window?.ethereum as WalletLinkProvider & {
      isCoinbaseWallet: boolean;
    };
    if (provider?.isCoinbaseWallet === true) {
      // Handle mobile coinbase browser.
      this.isMobileMode = true;
      return window.ethereum;
    }
    this.defaultWalletParams = {
      appName: 'Rubic',
      appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
      darkMode: false
    };

    if (!blockchainId) {
      console.error('Desktop walletLink works only with predefined chainId');
      throw new UndefinedError();
    }

    const chainId = blockchainId;
    const chain = BlockchainsInfo.getBlockchainById(chainId);
    const walletLink = new WalletLink(this.defaultWalletParams);
    this.selectedChain = chainId.toString();
    return walletLink.makeWeb3Provider(chain.rpcLink, chainId);
  }

  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.wallet).eth.personal.sign(message, this.address, undefined);
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.wallet.request({ method: 'eth_requestAccounts' });

      const activeChain = (await this.wallet.request({ method: 'eth_chainId' })) as string;
      const chainInfo = BlockchainsInfo.getBlockchainById(parseInt(activeChain).toString());

      // in desktop version selected into modal chain should match mobile app selected chain
      if (!this.isMobileMode) {
        if (!new BigNumber(activeChain).eq(this.selectedChain)) {
          throw new WalletlinkWrongNetwork(
            BlockchainsInfo.getBlockchainById(this.selectedChain).label
          );
        }
      }

      this.selectedAddress = address;
      this.selectedChain = chainInfo.name;
      this.isEnabled = true;
      this.onNetworkChanges$.next(chainInfo);
      this.onAddressChanges$.next(address);
      this.storeService.setItem('chainId', Number(this.selectedChain));
    } catch (error) {
      if (!(error instanceof RubicError)) {
        throw new WalletlinkError();
      } else {
        throw error;
      }
    }
  }

  public async deActivate(): Promise<void> {
    this.wallet.close();
    this.onAddressChanges$.next(undefined);
    this.onNetworkChanges$.next(undefined);
    this.isEnabled = false;
  }

  public async addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletlinkError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    await this.wallet.request({
      method: 'wallet_watchAsset',
      params: [
        {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image
          }
        }
      ]
    });
  }

  public async switchChain(chainId: string): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEthChainParams): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
