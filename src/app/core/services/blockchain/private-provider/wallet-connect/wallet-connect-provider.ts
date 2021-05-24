import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { WalletlinkError } from 'src/app/shared/models/errors/provider/WalletlinkError';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import Web3 from 'web3';
import WalletConnect from '@walletconnect/web3-provider';
import networks from 'src/app/shared/constants/blockchain/networks';
import { BlockchainsInfo } from '../../blockchain-info';
import { PrivateProvider } from '../private-provider';
import { WalletconnectError } from '../../../../../shared/models/errors/provider/WalletconnectError';
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
    return this.isEnabled && Boolean(this.core?.selectedAddress);
  }

  public get address(): string {
    return this.selectedAddress;
  }

  constructor(
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>
  ) {
    super();
    this.isEnabled = false;
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;

    const rpcParams = networks.reduce(
      (prev, cur) => {
        return {
          rpc: {
            ...prev.rpc,
            [cur.id]: cur.rpcLink
          }
        };
      },
      { rpc: null }
    );
    this.core = new WalletConnect(rpcParams);
    web3.setProvider(this.core as any);
  }

  protected getAddress(): string {
    return this.isEnabled && this.selectedAddress;
  }

  protected getNetwork(): IBlockchain {
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
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(address);
    } catch (error) {
      console.error(`No Metamask installed. ${error}`);
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    await this.core.close();
    this.onAddressChanges.next(null);
    this.onNetworkChanges.next(null);
    this.isEnabled = false;
  }

  public addToken(token: SwapToken): Promise<void> {
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
      } as any
    });
  }
}
