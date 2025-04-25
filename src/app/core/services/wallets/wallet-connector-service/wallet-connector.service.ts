import { Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { MetamaskWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/metamask-wallet-adapter';
import { WalletConnectAdapter } from '@core/services/wallets/wallets-adapters/evm/wallet-connect-adapter';
import { CoinBaseWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/coin-base-wallet-adapter';
import { StoreService } from '@core/services/store/store.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { HttpService } from '@core/services/http/http.service';
import { TUI_IS_IOS } from '@taiga-ui/cdk';
import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { TrustWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/trust-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainName,
  CHAIN_TYPE,
  ChainType,
  EVM_BLOCKCHAIN_NAME,
  EvmBlockchainName,
  nativeTokensList
} from 'rubic-sdk';
import { TronLinkAdapter } from '@core/services/wallets/wallets-adapters/tron/tron-link-adapter';
import { blockchainScanner } from '@shared/constants/blockchain/blockchain-scanner';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { defaultBlockchainData } from '@core/services/wallets/wallet-connector-service/constants/default-blockchain-data';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { UserRejectNetworkSwitchError } from '@core/errors/models/provider/user-reject-network-switch-error';
import { ArgentWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/argent-wallet-adapter';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';
import { PhantomWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/phantom-wallet-adapter';
import { SolflareWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/solflare-wallet-adapter';
import { SafeWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/safe-wallet-adapter';
import { TokenPocketWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/token-pocket-wallet-adapter';
import { TonConnectAdapter } from '../wallets-adapters/ton/ton-connect-adapter';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { MyTonWalletAdapter } from '../wallets-adapters/ton/my-ton-wallet-adapter';
import { TonkeeperAdapter } from '../wallets-adapters/ton/tonkeeper-adapter';
import { TelegramWalletAdapter } from '../wallets-adapters/ton/telegram-wallet-adapter';
import { HoldstationWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/holdstation-wallet-adapter';
import { ModalService } from '@core/modals/services/modal.service';
import { CtrlWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/ctrl-wallet-adapter';
import { BitgetWalletAdapter } from '../wallets-adapters/evm/bitget-wallet-adapter';

@Injectable({
  providedIn: 'root'
})
export class WalletConnectorService {
  private readonly networkChangeSubject$ = new BehaviorSubject<BlockchainName | null>(null);

  private readonly addressChangeSubject$ = new BehaviorSubject<string>(null);

  private privateProvider: CommonWalletAdapter;

  public get address(): string {
    return this.provider?.address;
  }

  private _selectedChainId = 1;

  public set selectedChain(blockchain: BlockchainName) {
    const chainId = blockchainId[blockchain];
    if (chainId) {
      this._selectedChainId = chainId;
    }
  }

  public get chainType(): ChainType {
    return this.provider?.chainType;
  }

  public get network(): BlockchainName | null {
    return this.provider?.network;
  }

  public get provider(): CommonWalletAdapter {
    return this.privateProvider;
  }

  public readonly networkChange$ = this.networkChangeSubject$.asObservable();

  public readonly addressChange$ = this.addressChangeSubject$.asObservable();

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly storeService: StoreService,
    private readonly errorService: ErrorsService,
    private readonly httpService: HttpService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    private readonly zone: NgZone,
    private readonly modalsService: ModalService
  ) {}

  public checkIfSafeEnv(): boolean {
    const params = new URLSearchParams(this.window.location.search);
    return params.has('useSafe') ? params.get('useSafe') === 'true' : false;
  }

  /**
   * Setups provider based on local storage.
   */
  public async setupProvider(): Promise<boolean> {
    const isSafeEnv = this.checkIfSafeEnv();
    console.info('isSafeEnv: ', isSafeEnv);
    const provider = this.storeService.getItem('RUBIC_PROVIDER');
    if (!provider && !isSafeEnv) {
      return false;
    }
    this.connectProvider(isSafeEnv ? WALLET_NAME.SAFE : provider);
    return true;
  }

  public connectProvider(walletName: WALLET_NAME, chainId?: number): void {
    this.privateProvider = this.createWalletAdapter(walletName, chainId || this._selectedChainId);
  }

  private createWalletAdapter(walletName: WALLET_NAME, chainId?: number): CommonWalletAdapter {
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
      return new TrustWalletAdapter(...defaultConstructorParameters, this.isIos);
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

    if (walletName === WALLET_NAME.HOLD_STATION) {
      return new HoldstationWalletAdapter(...defaultConstructorParameters, chainId);
    }

    this.errorService.catch(new WalletNotInstalledError());
  }

  public async activate(): Promise<void> {
    await this.provider.activate();
    if (
      this.provider.walletName !== WALLET_NAME.SAFE &&
      this.provider.walletName !== WALLET_NAME.TON_CONNECT
    ) {
      this.storeService.setItem('RUBIC_PROVIDER', this.provider.walletName);
    }
  }

  public deactivate(): void {
    this.storeService.deleteItem('RUBIC_PROVIDER');
    this.storeService.deleteItem('RUBIC_CHAIN_ID');
    return this.provider?.deactivate();
  }

  public getBlockchainsBasedOnWallet(): BlockchainName[] {
    if (this.chainType === CHAIN_TYPE.EVM) {
      return Object.values(EVM_BLOCKCHAIN_NAME);
    }
    if (this.chainType === CHAIN_TYPE.TRON) {
      return [BLOCKCHAIN_NAME.TRON];
    }
    if (this.chainType === CHAIN_TYPE.SOLANA) {
      return [BLOCKCHAIN_NAME.SOLANA];
    }
    if (this.chainType === CHAIN_TYPE.TON) {
      return [BLOCKCHAIN_NAME.TON];
    }
    if (this.chainType === CHAIN_TYPE.BITCOIN) {
      return [BLOCKCHAIN_NAME.BITCOIN];
    }

    throw new Error('Blockchain is not supported');
  }

  /**
   * Prompts the user to switch the network, or add it to the wallet if the network has not been added yet.
   * @param evmBlockchainName Chain to switch to.
   * @param customRpcUrl Custom rpc to add to user wallet.
   * @return True if the network switch was successful, otherwise false.
   */
  public async switchChain(
    evmBlockchainName: EvmBlockchainName,
    customRpcUrl?: string
  ): Promise<boolean> {
    if (!(this.provider instanceof EvmWalletAdapter)) {
      throw new RubicError("Can't switch chain in non evm wallet!");
    }
    const chainId = `0x${blockchainId[evmBlockchainName].toString(16)}`;

    try {
      await this.provider.switchChain(chainId);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await this.addChain(evmBlockchainName, customRpcUrl);
          await this.provider.switchChain(chainId);
          return true;
        } catch (err) {
          this.errorService.catch(err);
        }
      } else if (switchError.code === 4001) {
        this.errorService.catch(new UserRejectNetworkSwitchError());
      } else if (
        switchError.message.includes(
          'Missing or invalid. request() method: wallet_switchEthereumChain'
        ) &&
        this.provider instanceof HoldstationWalletAdapter
      ) {
        const reconnect = await firstValueFrom(
          this.modalsService.openWcChangeNetworkModal(this.network, evmBlockchainName)
        );

        if (reconnect) {
          try {
            await this.provider.deactivate();
            const decimalId = parseInt(chainId, 16);
            await this.provider.updateDefaultChain(decimalId);
            await this.provider.activate();
          } catch (err) {
            await this.provider.deactivate();
            this.errorService.catch(err);
          }
        }
      } else {
        this.errorService.catch(switchError);
      }
    }
    return false;
  }

  /**
   * Adds new network through wallet provider.
   * @param evmBlockchainName Chain to switch to.
   * @param customRpcUrl Custom rpc to add to user wallet.
   */
  public async addChain(
    evmBlockchainName: EvmBlockchainName,
    customRpcUrl?: string
  ): Promise<void> {
    const params = this.getRpcParams(evmBlockchainName, customRpcUrl);
    await (this.provider as EvmWalletAdapter).addChain(params);
  }

  private getRpcParams(
    evmBlockchainName: EvmBlockchainName,
    customRpcUrl?: string
  ): AddEvmChainParams {
    const chainId = blockchainId[evmBlockchainName];
    const nativeCoin = nativeTokensList[evmBlockchainName];
    const scannerUrl = blockchainScanner[evmBlockchainName].baseUrl;
    const icon = blockchainIcon[evmBlockchainName];

    let chainName = blockchainLabel[evmBlockchainName];
    let rpcUrl: string;
    const defaultData = defaultBlockchainData[evmBlockchainName];

    if (customRpcUrl) {
      chainName = blockchainLabel[evmBlockchainName] + ' Protected';
      rpcUrl = customRpcUrl;
    } else if (defaultData) {
      chainName = defaultData.name;
      rpcUrl = defaultData.rpc;
    } else {
      rpcUrl = rpcList[evmBlockchainName][0];
    }

    return {
      chainId: `0x${chainId.toString(16)}`,
      chainName,
      nativeCurrency: {
        name: nativeCoin.name,
        symbol: nativeCoin.symbol,
        decimals: 18
      },
      rpcUrls: [rpcUrl],
      blockExplorerUrls: [scannerUrl],
      iconUrls: [`${this.window.location.origin}/${icon}`]
    };
  }
}
