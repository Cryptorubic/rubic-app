import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { WalletlinkError } from 'src/app/core/errors/models/provider/WalletlinkError';
import Web3 from 'web3';
import WalletConnect from '@walletconnect/web3-provider';
import networks from 'src/app/shared/constants/blockchain/networks';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletconnectError } from 'src/app/core/errors/models/provider/WalletconnectError';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { BlockchainsInfo } from '../../blockchain-info';
import { PrivateProvider } from '../private-provider';
import { WALLET_NAME } from '../../../../header/components/header/components/wallets-modal/models/providers';

export class WalletConnectProvider extends PrivateProvider {
  private isEnabled: boolean;

  private readonly core: WalletConnect;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this.core;
  }

  get isActive(): boolean {
    return this.isEnabled && this.core?.accounts.length > 0;
  }

  public get address(): string {
    return this.selectedAddress;
  }

  constructor(
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>,
    errorsService: ErrorsService
  ) {
    super(errorsService);
    this.isEnabled = false;
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;

    const rpcParams = networks.reduce((prev, cur) => {
      return {
        ...prev,
        [cur.id]: cur.rpcLink
      };
    }, {});
    this.core = new WalletConnect({
      infuraId: 'ecf1e6d0427b458b89760012a8500abf',
      rpc: rpcParams,
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModalOptions: {
        mobileLinks: [
          'metamask',
          'trust',
          'bitpay',
          'Argent',
          'Crypto.com',
          'Ledger',
          '1inch',
          'coin98',
          'Huobi',
          'BitKeep',
          'PlasmaPay'
        ]
      }
    });
    // eslint-disable-next-line
    web3.setProvider(this.core as any);
    this.core.on('chainChanged', (chain: string) => {
      this.selectedChain = chain;
      if (this.isEnabled) {
        chainChange.next(BlockchainsInfo.getBlockchainById(chain));
        console.info('Chain changed', chain);
      }
    });
    this.core.on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.onAddressChanges.next(this.selectedAddress);
        console.info('Selected account changed to', accounts[0]);
      }
    });
  }

  public getAddress(): string {
    return this.isEnabled && this.selectedAddress;
  }

  public getNetwork(): IBlockchain {
    return (
      this.isEnabled && BlockchainsInfo.getBlockchainById(this.selectedChain as BLOCKCHAIN_NAME)
    );
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.WALLET_CONNECT;
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.core.enable();
      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain = String(this.core.chainId);
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(address);
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    await this.core.close();
    this.onAddressChanges.next(null);
    this.onNetworkChanges.next(null);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletconnectError();
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
