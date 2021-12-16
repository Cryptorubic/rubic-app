import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/common/common-wallet-adapter';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { Connection } from '@solana/web3.js';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { IBlockchain } from '@shared/models/blockchain/IBlockchain';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';

export abstract class CommonSolanaWalletAdapter extends CommonWalletAdapter<SolanaWallet | null> {
  public get isMultiChainWallet(): boolean {
    return false;
  }

  get walletType(): BlockchainType {
    return 'solana';
  }

  public readonly connection: Connection;

  protected constructor(
    errorsService: ErrorsService,
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<IBlockchain>,
    connection: Connection
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$);
    this.connection = connection;
  }

  public async signPersonal(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    const { signature } = await this.wallet.signMessage(encodedMessage, 'utf-8');

    return Buffer.from(signature).toString('base64');
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  protected getNetwork(): IBlockchain | null {
    if (this.isEnabled && this.selectedChain) {
      return BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.SOLANA);
    }
    return null;
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
