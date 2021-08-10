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
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import BigNumber from 'bignumber.js';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { WalletlinkWrongNetwork } from 'src/app/core/errors/models/provider/WalletlinkWrongNetwork';
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
    blockchainId: number
  ) {
    super(errorService);
    this.isEnabled = false;

    // @ts-ignore
    if (window.ethereum && window.ethereum.isCoinbaseWallet === true) {
      // mobile coinbase browser
      this.core = window.ethereum;
    } else {
      this.defaultWalletParams = {
        appName: 'Rubic',
        appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
        darkMode: false
      };

      if (!blockchainId) {
        console.error('WalletLink works only with predefined chainId');
        throw new UndefinedError();
      }

      const chainId = blockchainId;
      const chain = BlockchainsInfo.getBlockchainById(chainId);
      const walletLink = new WalletLink(this.defaultWalletParams);
      this.core = walletLink.makeWeb3Provider(chain.rpcLink, chainId);
      this.selectedChain = chainId.toString();
    }

    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;
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

      const activeChain = (await this.core.request({ method: 'eth_chainId' })) as string;
      const chainInfo = BlockchainsInfo.getBlockchainById(this.selectedChain);

      if (!new BigNumber(activeChain).eq(this.selectedChain)) {
        throw new WalletlinkWrongNetwork(chainInfo.label);
      }

      this.onNetworkChanges.next(chainInfo);
      this.onAddressChanges.next(address);
      this.selectedAddress = address;
      this.selectedChain = chainInfo.name;
      this.isEnabled = true;
    } catch (error) {
      if (!(error instanceof RubicError)) {
        throw new WalletlinkError();
      } else {
        throw error;
      }
    }
  }

  public async deActivate(): Promise<void> {
    this.core.close();
    this.onAddressChanges.next(undefined);
    this.onNetworkChanges.next(undefined);
    this.isEnabled = false;
  }

  public async addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletlinkError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    await this.core.request({
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
