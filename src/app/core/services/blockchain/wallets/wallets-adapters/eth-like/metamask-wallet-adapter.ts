import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { NetworkError } from '@core/errors/models/provider/NetworkError';
import { IBlockchain } from '@shared/models/blockchain/IBlockchain';
import { MetamaskError } from '@core/errors/models/provider/MetamaskError';
import { ErrorsService } from '@core/errors/errors.service';
import { Token } from '@shared/models/tokens/Token';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { CoinbaseExtensionError } from '@core/errors/models/provider/CoinbaseExtensionError';
import { SignRejectError } from '@core/errors/models/provider/SignRejectError';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/common/common-wallet-adapter';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/providers';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';

export class MetamaskWalletAdapter extends CommonWalletAdapter {
  public get isMultiChainWallet(): boolean {
    return false;
  }

  get walletType(): BlockchainType {
    return 'ethLike';
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.METAMASK;
  }

  constructor(
    web3: Web3,
    onNetworkChanges$: BehaviorSubject<IBlockchain>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$);
    const { ethereum } = window;
    MetamaskWalletAdapter.checkErrors(ethereum);
    web3.setProvider(ethereum);
    this.wallet = ethereum;
    this.handleEvents();
  }

  /**
   * Checks possible metamask errors.
   * @param ethereum Global ethereum object.
   */
  private static checkErrors(ethereum: RubicAny): void {
    if (!ethereum?.isMetaMask) {
      throw new MetamaskError();
    }

    // installed coinbase chrome extension
    if (ethereum.hasOwnProperty('overrideIsMetaMask')) {
      throw new CoinbaseExtensionError();
    }
  }

  /**
   * Handles chain and account change events.
   */
  private handleEvents(): void {
    this.wallet.on('chainChanged', (chain: string) => {
      this.selectedChain = chain;
      if (this.isEnabled) {
        this.onNetworkChanges$.next(BlockchainsInfo.getBlockchainById(chain));
        console.info('Chain changed', chain);
      }
    });
    this.wallet.on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.onAddressChanges$.next(this.selectedAddress);
        console.info('Selected account changed to', accounts[0]);
      }
      if (!this.selectedAddress) {
        this.selectedChain = null;
        this.deActivate();
      }
    });
  }

  public async setupDefaultValues(): Promise<void> {
    const chain = await this.wallet.request({ method: 'eth_chainId' });
    const accounts = await this.wallet.request({ method: 'eth_accounts' });
    this.selectedChain = chain;
    [this.selectedAddress] = accounts;
  }

  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.wallet).eth.personal.sign(message, this.address, undefined);
  }

  public async activate(params?: unknown[]): Promise<void> {
    try {
      const accounts = await this.wallet.request({
        method: 'eth_requestAccounts',
        params
      });
      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;
      this.selectedChain = String(chain);
      [this.selectedAddress] = accounts;
      this.onNetworkChanges$.next(this.getNetwork());
      this.onAddressChanges$.next(this.selectedAddress);
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }
      throw new MetamaskError();
    }
  }

  public async requestPermissions(): Promise<{ parentCapability: string }[]> {
    try {
      return this.wallet.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new MetamaskError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    return this.wallet.request({
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
