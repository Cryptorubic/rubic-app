import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { WalletlinkError } from 'src/app/core/errors/models/provider/WalletlinkError';
import WalletLink, { WalletLinkProvider as CoinbaseProvider } from 'walletlink';
import { WalletLinkOptions } from 'walletlink/dist/WalletLink';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { BlockchainsInfo } from '../../blockchain-info';
import { PrivateProvider } from '../private-provider';
import { WALLET_NAME } from '../../../../header/components/header/components/wallets-modal/models/providers';

export class WalletLinkProvider extends PrivateProvider {
  private isEnabled: boolean;

  private readonly defaultWalletParams: WalletLinkOptions;

  private readonly core: CoinbaseProvider;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this.core;
  }

  get isActive(): boolean {
    return this.isEnabled && Boolean(this.core?.selectedAddress);
  }

  public get address(): string {
    return this.selectedAddress;
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.WALLET_LINK;
  }

  constructor(
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>,
    errorService: ErrorsService,
    blockchainId?: number
  ) {
    super(errorService);
    this.isEnabled = false;
    this.defaultWalletParams = {
      appName: 'Rubic',
      appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
      darkMode: false
    };
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;
    const chainId = blockchainId || 42;
    const chain = BlockchainsInfo.getBlockchainById(chainId);
    const walletLink = new WalletLink(this.defaultWalletParams);
    this.core = walletLink.makeWeb3Provider(chain.rpcLink, chainId);
    web3.setProvider(this.core);
  }

  public getAddress(): string {
    return this.isEnabled && this.selectedAddress;
  }

  public getNetwork(): IBlockchain {
    return (
      this.isEnabled &&
      this.selectedChain &&
      BlockchainsInfo.getBlockchainByName(this.selectedChain as BLOCKCHAIN_NAME)
    );
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.core.send('eth_requestAccounts');

      const chain = BlockchainsInfo.getBlockchainById(42);
      this.onNetworkChanges.next(chain);
      this.onAddressChanges.next(address);
      this.selectedAddress = address;
      this.selectedChain = chain.name;
      this.isEnabled = true;
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    this.core.close();
    this.onAddressChanges.next(undefined);
    this.onNetworkChanges.next(undefined);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletlinkError();
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
      } as any
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
