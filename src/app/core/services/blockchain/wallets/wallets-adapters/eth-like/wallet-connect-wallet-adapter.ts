import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from '@shared/models/blockchain/IBlockchain';
import { NetworkError } from '@core/errors/models/provider/NetworkError';
import { WalletlinkError } from '@core/errors/models/provider/WalletlinkError';
import Web3 from 'web3';
import WalletConnect from '@walletconnect/web3-provider';
import networks from '@shared/constants/blockchain/networks';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletconnectError } from '@core/errors/models/provider/WalletconnectError';
import { Token } from '@shared/models/tokens/Token';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/providers';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export class WalletConnectWalletAdapter extends CommonWalletAdapter<WalletConnect> {
  get isMultiChainWallet(): boolean {
    const multiChainWalletNames = ['Trust Wallet Android', 'Trust Wallet'];
    const walletName = this.wallet.connector.peerMeta.name;
    return multiChainWalletNames.includes(walletName);
  }

  get walletType(): 'solana' | 'ethLike' {
    return 'ethLike';
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.WALLET_CONNECT;
  }

  constructor(
    web3: Web3,
    onNetworkChanges$: BehaviorSubject<IBlockchain>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$);
    this.wallet = this.getWallet();
    web3.setProvider(this.wallet as RubicAny);
    this.handleEvents();
  }

  /**
   * Creates instance of Wallet.
   * @return WalletConnect The wallet.
   */
  private getWallet(): WalletConnect {
    const rpcParams: Record<typeof networks[number]['id'], string> = networks
      .filter(network => isFinite(network.id))
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.id]: cur.rpcLink
        };
      }, {});
    return new WalletConnect({
      rpc: rpcParams,
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true
    });
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

  public async signPersonal(message: string): Promise<string> {
    return this.wallet.connector.signPersonalMessage([message, this.address]);
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.wallet.enable();
      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain = String(this.wallet.chainId);
      this.onNetworkChanges$.next(this.getNetwork());
      this.onAddressChanges$.next(address);
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    await this.wallet.close();
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletconnectError();
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
