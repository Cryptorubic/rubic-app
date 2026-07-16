import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, TokenAmount } from '@cryptorubic/core';
import {
  FreighterModule,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork,
  ModalThemes
} from '@creit.tech/stellar-wallets-kit';
import { WalletConnectModule } from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NeedTrustlineOptions } from './models/need-trustline-options';
import { TRUSTLINE_AFTER_SWAP_PROVIDERS } from './constants/trustline-after-swap-providers';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { StellarCrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/stellar-cross-chain-trade/stellar-cross-chain-trade';
import { WALLET_CONNECT_CONFIG } from './constants/wallet-connect-config';
import { StellarAdapter } from 'node_modules/@cryptorubic/web3/src/lib/adapter/adapters/adapter-stellar/stellar-adapter';
import { RippleAdapter } from '@cryptorubic/web3';
import { XamanInstance } from '@app/core/services/wallets/wallets-adapters/xrpl/utils/xaman-instance';
import { toRippleWalletCore } from '@app/core/services/wallets/wallets-adapters/xrpl/utils/to-ripple-wallet-core';
import { XamanSignService } from '@app/core/services/wallets/wallets-adapters/xrpl/services/xaman-sign.service';
import { SdkLoaderService } from '@app/core/services/sdk/sdk-loader.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable({
  providedIn: 'root'
})
export class TrustlineService {
  private readonly stellarAdapter: StellarAdapter = this.adapterFactory.getAdapter(
    BLOCKCHAIN_NAME.STELLAR
  );

  private readonly rippleAdapter: RippleAdapter = this.adapterFactory.getAdapter(
    BLOCKCHAIN_NAME.RIPPLE
  );

  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly errorService: ErrorsService,
    private readonly xamanSignService: XamanSignService,
    private readonly sdkLoaderService: SdkLoaderService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public async connectReceiverWallet(
    receiverAddress: string,
    blockchain: typeof BLOCKCHAIN_NAME.STELLAR | typeof BLOCKCHAIN_NAME.RIPPLE
  ): Promise<boolean> {
    if (blockchain === BLOCKCHAIN_NAME.RIPPLE) {
      return this.connectRippleReceiverWallet(receiverAddress);
    }

    return this.connectStellarReceiverWallet(receiverAddress);
  }

  private async connectRippleReceiverWallet(receiverAddress: string): Promise<boolean> {
    try {
      await this.ensureRippleTrustlineWallet(receiverAddress, true);
      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  private async ensureRippleTrustlineWallet(
    expectedAccount: string,
    isReceiverAccount: boolean
  ): Promise<void> {
    const xumm = await XamanInstance.waitUntilReady();

    if (!xumm.state.signedIn) {
      const authorizeResult = await xumm.authorize();

      if (authorizeResult instanceof Error) {
        throw authorizeResult;
      }

      const networkType = await xumm.user.networkType;

      if (networkType !== 'MAINNET') {
        throw new Error('Only XRP Ledger mainnet is supported.');
      }

      const address = await xumm.user.account;

      if (!address) {
        throw new Error('Failed to get Xaman wallet address.');
      }

      if (address !== expectedAccount) {
        throw new Error('Connected wallet must be the same as receiver');
      }
    }

    if (!this.rippleAdapter.connected) {
      this.rippleAdapter.initWeb3Client();
    }

    this.rippleAdapter.signer.setWalletAddress(expectedAccount);
    this.rippleAdapter.signer.setWallet(
      toRippleWalletCore(xumm, this.xamanSignService, {
        expectedAccount,
        isReceiverAccount,
        submitSignedBlob: async blob => {
          const response = await this.rippleAdapter.public.submitAndWait(blob);
          return response.result.hash;
        }
      })
    );
  }

  private async connectStellarReceiverWallet(receiverAddress: string): Promise<boolean> {
    const wallet = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      modules: [
        new FreighterModule(),
        new LobstrModule(),
        new WalletConnectModule(WALLET_CONNECT_CONFIG)
      ],
      modalTheme: ModalThemes.DARK
    });

    const promise = new Promise<boolean>((resolve, reject) => {
      wallet.openModal({
        onWalletSelected: async option => {
          wallet.setWallet(option.id);
          try {
            const { address } = await wallet.getAddress();
            if (address !== receiverAddress) {
              reject(new Error('Connected wallet must be the same as receiver'));
            }

            if (!this.stellarAdapter.connected) {
              this.stellarAdapter.initWeb3Client();
            }

            this.stellarAdapter.signer.setWalletAddress(address);
            this.stellarAdapter.signer.setWallet(wallet);

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
      return await promise;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async addTrustline(
    tokenAddress: string,
    blockchain:
      | typeof BLOCKCHAIN_NAME.STELLAR
      | typeof BLOCKCHAIN_NAME.RIPPLE = BLOCKCHAIN_NAME.STELLAR,
    expectedAccount?: string,
    isReceiverAccount = false
  ): Promise<string | null> {
    const shouldRestoreConnectedRippleWallet =
      blockchain === BLOCKCHAIN_NAME.RIPPLE && isReceiverAccount;

    try {
      if (blockchain === BLOCKCHAIN_NAME.RIPPLE) {
        if (!expectedAccount) {
          throw new Error('Expected XRPL account is required to add trustline.');
        }

        await this.ensureRippleTrustlineWallet(expectedAccount, isReceiverAccount);
      }

      const adapter =
        blockchain === BLOCKCHAIN_NAME.RIPPLE ? this.rippleAdapter : this.stellarAdapter;
      const hash = await adapter.addTrustline(tokenAddress);
      return hash;
    } catch (err) {
      this.errorService.catch(err);
      return null;
    } finally {
      if (shouldRestoreConnectedRippleWallet) {
        this.restoreRippleConnectedWallet();
      }
    }
  }

  private restoreRippleConnectedWallet(): void {
    if (
      !this.walletConnectorService.address ||
      this.walletConnectorService.chainType !== CHAIN_TYPE.RIPPLE
    ) {
      return;
    }

    this.sdkLoaderService.onAddressChange(this.walletConnectorService.address);
  }

  public async checkTrustline(
    trade: CrossChainTrade | OnChainTrade,
    fromAddress: string,
    receiver?: string
  ): Promise<NeedTrustlineOptions> {
    const { from: _from, to, type } = trade;
    const defaultOptions: NeedTrustlineOptions = {
      needTrustlineAfterSwap: false,
      needTrustlineBeforeSwap: false
    };

    try {
      if (to.blockchain === BLOCKCHAIN_NAME.STELLAR || to.blockchain === BLOCKCHAIN_NAME.RIPPLE) {
        const adapter =
          to.blockchain === BLOCKCHAIN_NAME.RIPPLE ? this.rippleAdapter : this.stellarAdapter;
        const address = receiver || fromAddress;
        if (address) {
          if (!adapter.connected) {
            adapter.initWeb3Client();
          }

          const needTrustline = await adapter.needTrustline(to, address);

          return TRUSTLINE_AFTER_SWAP_PROVIDERS.includes(type)
            ? { ...defaultOptions, needTrustlineAfterSwap: needTrustline }
            : { ...defaultOptions, needTrustlineBeforeSwap: needTrustline };
        }
      }

      if (trade instanceof StellarCrossChainTrade && fromAddress) {
        const transitToken = trade.getTrustlineTransitToken();

        if (transitToken) {
          const needTransitTokenTrustline = await this.stellarAdapter.needTrustline(
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
