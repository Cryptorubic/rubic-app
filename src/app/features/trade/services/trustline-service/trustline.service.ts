import { Injectable } from '@angular/core';
import { TargetNetworkAddressService } from '../target-network-address-service/target-network-address.service';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { StellarAdapter } from '@cryptorubic/web3/src/lib/adapter/adapters/adapter-stellar/stellar-adapter';
import { BLOCKCHAIN_NAME, PriceTokenAmount } from '@cryptorubic/core';
import {
  FreighterModule,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork,
  ModalThemes
} from '@creit.tech/stellar-wallets-kit';
import { firstValueFrom } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { SwapsFormService } from '../swaps-form/swaps-form.service';

@Injectable()
export class TrustlineService {
  private walletKit = new StellarWalletsKit({
    network: WalletNetwork.PUBLIC,
    modules: [new LobstrModule(), new FreighterModule()],
    modalTheme: ModalThemes.DARK
  });

  private readonly adapter: StellarAdapter = this.adapterFactory.getAdapter(
    BLOCKCHAIN_NAME.STELLAR
  );

  public readonly truslineToken$ = this.swapsFormService.toToken$;

  constructor(
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly swapsFormService: SwapsFormService,
    private readonly errorService: ErrorsService
  ) {}

  public async connectReceiverAddress(): Promise<void> {
    try {
      this.walletKit.openModal({
        onWalletSelected: async option => {
          this.walletKit.setWallet(option.id);
          const { address } = await this.walletKit.getAddress();
          if (address !== this.targetAddressService.address) {
            throw new Error('Connected wallet must be the same as receiver');
          }
        },
        modalTitle: 'Connect Receiver Wallet'
      });
    } catch (err) {
      this.errorService.catch(err);
    }
  }

  public async addTrustline(): Promise<string | null> {
    try {
      const toToken = await firstValueFrom(this.truslineToken$);

      if (!this.adapter.connected) {
        this.adapter.signer.setWalletAddress(this.targetAddressService.address);
        this.adapter.signer.setWallet(this.walletKit);
        this.adapter.initWeb3Client();
      }

      const hash = await this.adapter.addTrustline(toToken.address);
      return hash;
    } catch (err) {
      this.errorService.catch(err);
      return null;
    }
  }

  public async checkTrustline(
    fromToken: PriceTokenAmount,
    toToken: PriceTokenAmount,
    fromAddress: string,
    receiver?: string
  ): Promise<boolean> {
    if (toToken.blockchain === BLOCKCHAIN_NAME.STELLAR) {
      if (fromToken.blockchain === toToken.blockchain) {
        return this.adapter.needTrustline(toToken, receiver || fromAddress);
      } else if (receiver) {
        return this.adapter.needTrustline(toToken, receiver);
      }
    }

    return false;
  }
}
