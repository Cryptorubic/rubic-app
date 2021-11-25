import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from '@shared/models/blockchain/IBlockchain';
import { ErrorsService } from '@core/errors/errors.service';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';

import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/providers';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import CustomError from '@core/errors/models/custom-error';
import { PublicKey } from '@solana/web3.js';
import { PhantomWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';

export class PhantomWalletAdapter extends CommonWalletAdapter {
  private isEnabled = false;

  private core: PhantomWallet | null = null;

  private selectedAddress: string;

  private selectedChain: string;

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly onAddressChanges$: BehaviorSubject<string>;

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly onNetworkChanges$: BehaviorSubject<IBlockchain>;

  public get isMultiChainWallet(): boolean {
    return false;
  }

  get isInstalled(): boolean {
    return Boolean(this.core);
  }

  get isActive(): boolean {
    return this.isEnabled && Boolean(this.selectedAddress);
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.PHANTOM;
  }

  constructor(
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService
  ) {
    super(errorsService);
    this.onAddressChanges$ = accountChange$;
    this.onNetworkChanges$ = chainChange$;
  }

  public getAddress(): string {
    if (this.isEnabled) {
      return this.selectedAddress;
    }
    return null;
  }

  public async signPersonal(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encodedMessage = encoder.encode(message);
    const { signature } = await this.core.signMessage(encodedMessage);
    return decoder.decode(signature);
  }

  public getNetwork(): IBlockchain {
    if (this.isEnabled) {
      return this.selectedChain
        ? BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.SOLANA)
        : undefined;
    }
    return null;
  }

  public async activate(): Promise<void> {
    const wallet = typeof window !== 'undefined' && window.solana;

    if (!wallet) {
      throw new CustomError('Wallet is not instelled');
    }
    if (!wallet.isPhantom) {
      throw new CustomError('Phantom is not instelled');
    }

    if (!wallet.isConnected) {
      // HACK: Phantom doesn't reject or emit an event if the popup is closed
      const handleDisconnect = wallet._handleDisconnect;
      try {
        await new Promise<void>((resolve, reject) => {
          const connect = () => {
            wallet.off('connect', connect);
            resolve();
          };

          wallet._handleDisconnect = (...args: unknown[]) => {
            wallet.off('connect', connect);
            reject(new CustomError('User close modal'));
            return handleDisconnect.apply(wallet, args);
          };

          wallet.on('connect', connect);

          wallet.connect().catch((reason: unknown) => {
            wallet.off('connect', connect);
            reject(reason);
          });
        });
      } catch (error: unknown) {
        if (error instanceof CustomError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new CustomError(error?.message);
        }
      } finally {
        wallet._handleDisconnect = handleDisconnect;
      }
    }

    if (!wallet.publicKey) {
      throw new CustomError('Connection error');
    }

    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(wallet.publicKey.toBytes());
    } catch (error: unknown) {
      throw new CustomError('Public key error');
    }
    this.isEnabled = true;
    wallet.on('disconnect', this.deActivate);

    this.core = wallet;
    this.selectedAddress = publicKey.toBase58();
    this.selectedChain = 'mainnet';

    this.onNetworkChanges$.next(this.getNetwork());
    this.onAddressChanges$.next(this.selectedAddress);
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  public addToken(/* token: Token */): Promise<void> {
    return null;
    // if (!this.isActive) {
    //   throw new MetamaskError();
    // }
    // if (this.getNetwork().name !== token.blockchain) {
    //   throw new NetworkError(token.blockchain);
    // }
    //
    // return this.core.request({
    //   method: 'wallet_watchAsset',
    //   params: {
    //     type: 'ERC20',
    //     options: {
    //       address: token.address,
    //       symbol: token.symbol,
    //       decimals: token.decimals,
    //       image: token.image
    //     }
    //   }
    // });
  }

  public async switchChain(/* chainId: string */): Promise<null | never> {
    return null;
    // return this.core.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId }]
    // });
  }

  public async addChain(/* params: AddEthChainParams */): Promise<null | never> {
    return null;
    // return this.core.request({
    //   method: 'wallet_addEthereumChain',
    //   params: [params]
    // });
  }
}
