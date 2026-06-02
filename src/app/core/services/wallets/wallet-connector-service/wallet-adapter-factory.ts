import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CommonWalletAdapter } from '../wallets-adapters/common-wallet-adapter';
import { MetamaskWalletAdapter } from '../wallets-adapters/evm/metamask-wallet-adapter';
import { MetamaskSolanaWalletAdapter } from '../wallets-adapters/solana/metamask-solana-wallet-adapter';
import { WalletConnectAdapter } from '../wallets-adapters/evm/wallet-connect-adapter';
import { BitgetWalletAdapter } from '../wallets-adapters/evm/bitget-wallet-adapter';
import { CoinBaseWalletAdapter } from '../wallets-adapters/evm/coin-base-wallet-adapter';
import { ArgentWalletAdapter } from '../wallets-adapters/evm/argent-wallet-adapter';
import { TrustWalletAdapter } from '../wallets-adapters/evm/trust-wallet-adapter';
import { TronLinkAdapter } from '../wallets-adapters/tron/tron-link-adapter';
import { PhantomWalletAdapter } from '../wallets-adapters/solana/phantom-wallet-adapter';
import { SolflareWalletAdapter } from '../wallets-adapters/solana/solflare-wallet-adapter';
import { SafeWalletAdapter } from '../wallets-adapters/evm/safe-wallet-adapter';
import { TokenPocketWalletAdapter } from '../wallets-adapters/evm/token-pocket-wallet-adapter';
import { TonConnectAdapter } from '../wallets-adapters/ton/ton-connect-adapter';
import { MyTonWalletAdapter } from '../wallets-adapters/ton/my-ton-wallet-adapter';
import { TonkeeperAdapter } from '../wallets-adapters/ton/tonkeeper-adapter';
import { TelegramWalletAdapter } from '../wallets-adapters/ton/telegram-wallet-adapter';
import { CtrlWalletAdapter } from '../wallets-adapters/btc/ctrl-wallet-adapter';
import { SlushWalletAdapter } from '../wallets-adapters/sui/slush-wallet-adapter';
import { SuietWalletAdapter } from '../wallets-adapters/sui/suiet-wallet-adapter';
import { HoldstationWalletAdapter } from '../wallets-adapters/evm/holdstation-wallet-adapter';
import { BinanceWalletAdapter } from '../wallets-adapters/evm/binance-wallet-adapter';
import { BackpackSolanaWalletAdapter } from '../wallets-adapters/solana/backpack-solana-wallet-adapter';
import { LobstrWalletAdapter } from '../wallets-adapters/stellar/lobstr-wallet-adapter';
import { FreighterWalletAdapter } from '../wallets-adapters/stellar/freighter-wallet-addapter';
import { StellarWalletConnectAdapter } from '../wallets-adapters/stellar/stellar-wallet-connect-adapter';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { StoreService } from '../../store/store.service';
import { HttpService } from '../../http/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';
import { AddressChangedMsg } from '../models/events';

export class WalletAdapterFactory {
  private readonly networkChangeSubject$ = new BehaviorSubject<BlockchainName | null>(null);

  private readonly addressChangeSubject$: BehaviorSubject<AddressChangedMsg | null> =
    new BehaviorSubject<AddressChangedMsg | null>(null);

  public readonly networkChange$ = this.networkChangeSubject$.asObservable();

  public readonly addressChange$: Observable<AddressChangedMsg | null> =
    this.addressChangeSubject$.asObservable();

  constructor(
    private readonly storeService: StoreService,
    private readonly errorService: ErrorsService,
    private readonly httpService: HttpService,
    private readonly zone: NgZone,
    private readonly window: RubicWindow
  ) {}

  public createWalletAdapter(
    walletName: WALLET_NAME,
    isIos: boolean,
    chainId?: number
  ): CommonWalletAdapter {
    const defaultConstructorParameters = [
      this.addressChangeSubject$,
      this.networkChangeSubject$,
      this.errorService,
      this.zone,
      this.window
    ] as const;

    if (walletName === WALLET_NAME.METAMASK) {
      return new MetamaskWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.METAMASK_SOLANA) {
      return new MetamaskSolanaWalletAdapter(...defaultConstructorParameters, this.storeService);
    }

    if (walletName === WALLET_NAME.WALLET_CONNECT) {
      return new WalletConnectAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.BITGET) {
      return new BitgetWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.COIN_BASE) {
      return new CoinBaseWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.ARGENT) {
      return new ArgentWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.TRUST_WALLET) {
      return new TrustWalletAdapter(...defaultConstructorParameters, isIos);
    }

    if (walletName === WALLET_NAME.TRON_LINK) {
      return new TronLinkAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.PHANTOM) {
      return new PhantomWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.SOLFLARE) {
      return new SolflareWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.SAFE) {
      return new SafeWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.TOKEN_POCKET) {
      return new TokenPocketWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.TON_CONNECT) {
      return new TonConnectAdapter(
        ...defaultConstructorParameters,
        this.httpService,
        this.storeService
      );
    }

    if (walletName === WALLET_NAME.MY_TON_WALLET) {
      return new MyTonWalletAdapter(
        ...defaultConstructorParameters,
        this.httpService,
        this.storeService
      );
    }

    if (walletName === WALLET_NAME.TONKEEPER) {
      return new TonkeeperAdapter(
        ...defaultConstructorParameters,
        this.httpService,
        this.storeService
      );
    }

    if (walletName === WALLET_NAME.TELEGRAM_WALLET) {
      return new TelegramWalletAdapter(
        ...defaultConstructorParameters,
        this.httpService,
        this.storeService
      );
    }

    if (walletName === WALLET_NAME.CTRL) {
      return new CtrlWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.SLUSH) {
      return new SlushWalletAdapter(...defaultConstructorParameters);
    }
    if (walletName === WALLET_NAME.SUIET_WALLET) {
      return new SuietWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.HOLD_STATION) {
      return new HoldstationWalletAdapter(...defaultConstructorParameters, chainId);
    }

    if (walletName === WALLET_NAME.BINANCE_WALLET) {
      return new BinanceWalletAdapter(...defaultConstructorParameters, chainId);
    }

    if (walletName === WALLET_NAME.BACKPACK) {
      return new BackpackSolanaWalletAdapter(...defaultConstructorParameters, this.storeService);
    }

    if (walletName === WALLET_NAME.LOBSTR) {
      return new LobstrWalletAdapter(...defaultConstructorParameters, this.storeService);
    }

    if (walletName === WALLET_NAME.FREIGHTER) {
      return new FreighterWalletAdapter(...defaultConstructorParameters);
    }
    if (walletName === WALLET_NAME.STELLAR_WALLET_CONNECT) {
      return new StellarWalletConnectAdapter(...defaultConstructorParameters);
    }

    this.errorService.catch(new WalletNotInstalledError());
  }
}
