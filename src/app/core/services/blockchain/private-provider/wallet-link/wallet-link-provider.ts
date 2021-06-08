import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { WalletlinkError } from 'src/app/shared/models/errors/provider/WalletlinkError';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import WalletLink, { WalletLinkProvider as CoinbaseProvider } from 'walletlink';
import { WalletLinkOptions } from 'walletlink/dist/WalletLink';
import Web3 from 'web3';
import { BlockchainsInfo } from '../../blockchain-info';
import { PrivateProvider } from '../private-provider';
import { WALLET_NAME } from '../../../../header/components/header/components/wallets-modal/models/providers';
import { ErrorsService } from '../../../errors/errors.service';

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
    errorsService: ErrorsService,
    blockchainId?: number
  ) {
    super(errorsService);
    this.isEnabled = false;
    this.defaultWalletParams = {
      appName: 'Rubic',
      appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
      darkMode: false
    };
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;
    const chainId = blockchainId || 1;
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

      const chain = BlockchainsInfo.getBlockchainById(1);
      this.onNetworkChanges.next(chain);
      this.onAddressChanges.next(address);
      this.selectedAddress = address;
      this.selectedChain = chain.name;
      this.isEnabled = true;
    } catch (error) {
      this.errorsService.throw(new WalletlinkError());
    }
  }

  public async deActivate(): Promise<void> {
    this.core.close();
    this.onAddressChanges.next(undefined);
    this.onNetworkChanges.next(undefined);
    this.isEnabled = false;
  }

  public addToken(token: SwapToken): Promise<void> {
    if (!this.isActive) {
      this.errorsService.throw(new WalletlinkError());
    }
    if (this.getNetwork().name !== token.blockchain) {
      this.errorsService.throw(new NetworkError(token.blockchain));
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
}
