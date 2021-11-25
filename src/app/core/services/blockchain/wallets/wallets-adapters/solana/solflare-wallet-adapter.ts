import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from '@shared/models/blockchain/IBlockchain';
import { ErrorsService } from '@core/errors/errors.service';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';

import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/providers';
import CustomError from '@core/errors/models/custom-error';
import { PublicKey } from '@solana/web3.js';
import { SolflareWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { SignRejectError } from '@core/errors/models/provider/SignRejectError';

export class SolflareWalletAdapter extends CommonWalletAdapter<SolflareWallet | null> {
  get isMultiChainWallet(): boolean {
    return false;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.PHANTOM;
  }

  constructor(
    onNetworkChanges$: BehaviorSubject<IBlockchain>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$);
  }

  public async signPersonal(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encodedMessage = encoder.encode(message);
    const { signature } = await this.wallet.signMessage(encodedMessage, 'utf8');
    return decoder.decode(signature);
  }

  public async activate(): Promise<void> {
    const wallet = typeof window !== 'undefined' && window.solflare;
    await this.checkErrors(wallet);

    const publicKey = new PublicKey(wallet.publicKey.toBytes());
    this.isEnabled = true;
    wallet.on('disconnect', this.deActivate);

    this.wallet = wallet;
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
    // return this.wallet.request({
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
    // return this.wallet.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId }]
    // });
  }

  public async addChain(/* params: AddEthChainParams */): Promise<null | never> {
    return null;
    // return this.wallet.request({
    //   method: 'wallet_addEthereumChain',
    //   params: [params]
    // });
  }

  private async checkErrors(wallet: SolflareWallet): Promise<void> {
    if (!wallet) {
      throw new CustomError('Wallet is not instelled');
    }
    if (!wallet.isSolflare) {
      throw new CustomError('Phantom is not instelled');
    }

    if (!wallet.isConnected) {
      try {
        await wallet.connect();
      } catch (error: unknown) {
        throw new SignRejectError();
      }
    }

    // HACK: Solflare doesn't reject its promise if the popup is closed.
    if (!wallet.publicKey) {
      throw new CustomError('Connection error');
    }
  }
}
