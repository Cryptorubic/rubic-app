import { Injectable } from '@angular/core';
import { TargetNetworkAddressService } from '../target-network-address-service/target-network-address.service';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { StellarAdapter } from '@cryptorubic/web3/src/lib/adapter/adapters/adapter-stellar/stellar-adapter';
import { BLOCKCHAIN_NAME, TokenAmount } from '@cryptorubic/core';
import {
  FreighterModule,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork,
  ModalThemes
} from '@creit.tech/stellar-wallets-kit';
import { WalletConnectModule } from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { firstValueFrom, map } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NeedTrustlineOptions } from './models/need-trustline-options';
import { TRUSTLINE_AFTER_SWAP_PROVIDERS } from './constants/trustline-after-swap-providers';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { StellarCrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/stellar-cross-chain-trade/stellar-cross-chain-trade';
import { SwapsStateService } from '../swaps-state/swaps-state.service';
import { WALLET_CONNECT_CONFIG } from './constants/wallet-connect-config';

@Injectable()
export class TrustlineService {
  private readonly walletKit = new StellarWalletsKit({
    network: WalletNetwork.PUBLIC,
    modules: [
      new FreighterModule(),
      new LobstrModule(),
      new WalletConnectModule(WALLET_CONNECT_CONFIG)
    ],
    modalTheme: ModalThemes.DARK
  });

  private readonly adapter: StellarAdapter = this.adapterFactory.getAdapter(
    BLOCKCHAIN_NAME.STELLAR
  );

  public readonly trustlineToken$ = this.swapsStateService.currentTrade$.pipe(
    map(trade => {
      if (trade instanceof StellarCrossChainTrade) {
        return trade.getTrustlineTransitToken();
      }

      return trade.to;
    })
  );

  constructor(
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly swapsStateService: SwapsStateService,
    private readonly errorService: ErrorsService
  ) {}

  public async connectReceiverAddress(): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      this.walletKit.openModal({
        onWalletSelected: async option => {
          this.walletKit.setWallet(option.id);
          try {
            const { address } = await this.walletKit.getAddress();
            if (address !== this.targetAddressService.address) {
              reject(new Error('Connected wallet must be the same as receiver'));
            }
            this.adapter.signer.setWalletAddress(address);
            this.adapter.signer.setWallet(this.walletKit);

            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        modalTitle: 'Connect Receiver Wallet',
        onClosed: () => resolve(false)
      });
    });

    try {
      const isWalletConnected = await promise;
      return isWalletConnected;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async addTrustline(): Promise<string | null> {
    try {
      const toToken = await firstValueFrom(this.trustlineToken$);

      const hash = await this.adapter.addTrustline(toToken.address);
      return hash;
    } catch (err) {
      this.errorService.catch(err);
      return null;
    }
  }

  public async checkTrustline(
    trade: CrossChainTrade | OnChainTrade,
    fromAddress: string,
    receiver?: string
  ): Promise<NeedTrustlineOptions> {
    const { from, to, type } = trade;
    const defaultOptions: NeedTrustlineOptions = {
      needTrustlineAfterSwap: false,
      needTrustlineBeforeSwap: false
    };

    try {
      if (to.blockchain === BLOCKCHAIN_NAME.STELLAR) {
        const address = from.blockchain === to.blockchain ? receiver || fromAddress : receiver;
        if (address) {
          if (!this.adapter.connected) {
            this.adapter.initWeb3Client();
          }

          const needTrustline = await this.adapter.needTrustline(to, address);

          return TRUSTLINE_AFTER_SWAP_PROVIDERS.includes(type)
            ? { ...defaultOptions, needTrustlineAfterSwap: needTrustline }
            : { ...defaultOptions, needTrustlineBeforeSwap: needTrustline };
        }
      }

      if (trade instanceof StellarCrossChainTrade && fromAddress) {
        const transitToken = trade.getTrustlineTransitToken();

        if (transitToken) {
          const needTransitTokenTrustline = await this.adapter.needTrustline(
            new TokenAmount({
              ...transitToken,
              tokenAmount: '0'
            }),
            fromAddress
          );

          return {
            ...defaultOptions,
            needTrustlineBeforeSwap: needTransitTokenTrustline
          };
        }
      }

      return defaultOptions;
    } catch {
      return defaultOptions;
    }
  }
}
