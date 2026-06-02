import { Inject, Injectable, NgZone } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';

import { StoreService } from '@core/services/store/store.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { HttpService } from '@core/services/http/http.service';
import { TUI_IS_IOS } from '@taiga-ui/cdk';
import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { blockchainScanner } from '@shared/constants/blockchain/blockchain-scanner';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { defaultBlockchainData } from '@core/services/wallets/wallet-connector-service/constants/default-blockchain-data';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';
import { UserRejectNetworkSwitchError } from '@core/errors/models/provider/user-reject-network-switch-error';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { HoldstationWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/holdstation-wallet-adapter';
import { ModalService } from '@core/modals/services/modal.service';
import {
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  ChainType,
  EvmBlockchainName,
  nativeTokensList
} from '@cryptorubic/core';
import { WalletsManager } from '../wallets-manager/wallets-manager';
import { WalletAdapterFactory } from './wallet-adapter-factory';
import { AddressChangedMsg } from '../models/events';

@Injectable({
  providedIn: 'root'
})
export class WalletConnectorService {
  // private readonly networkChangeSubject$ = new BehaviorSubject<BlockchainName | null>(null);

  // private readonly addressChangeSubject$: BehaviorSubject<AddressChangedMsg | null> =
  //   new BehaviorSubject<AddressChangedMsg | null>(null);

  private readonly walletsManager: WalletsManager;

  // private readonly walletAdapterFactory: WalletAdapterFactory = null;
  private readonly walletAdapterFactory: WalletAdapterFactory;

  /**
   * @TODO_530 вместо privateProvider будут walletsManager.activeWallets
   */
  // private privateProvider: CommonWalletAdapter;

  public get activeWallets(): CommonWalletAdapter[] {
    return this.walletsManager.activeWallets;
  }

  public readonly activeWallets$: Observable<CommonWalletAdapter[]>;

  // public get address(): string {
  //   return this.provider?.address;
  // }

  private _selectedChainId = 1;

  public set selectedChain(blockchain: BlockchainName) {
    const chainId = blockchainId[blockchain];
    if (chainId) {
      this._selectedChainId = chainId;
    }
  }

  // public get chainType(): ChainType {
  //   return this.provider?.chainType;
  // }

  /**
   * supported chain types by activated wallets
   */
  public get chainTypes(): ChainType[] {
    return this.activeWallets.map(wallet => wallet.chainType);
  }

  // public get network(): BlockchainName | null {
  //   return this.provider?.network;
  // }

  public get networks(): BlockchainName[] {
    return this.activeWallets.map(wallet => wallet.network);
  }

  // public get provider(): CommonWalletAdapter {
  //   return this.privateProvider;
  // }

  public getActiveProvider(
    options: { chainType?: ChainType; walletName?: WALLET_NAME; blockchain?: BlockchainName } = {}
  ): CommonWalletAdapter | null {
    const walletAdapter = this.activeWallets.find(wallet => {
      let accepted = false;
      if (options.walletName) {
        accepted = wallet.walletName === options.walletName;
        if (!accepted) return false;
      }
      if (options.chainType) {
        accepted = wallet.chainType === options.chainType;
        if (!accepted) return false;
      }
      if (options.blockchain) {
        accepted = wallet.chainType === BlockchainsInfo.getChainType(options.blockchain);
        if (!accepted) return false;
      }
      return accepted;
    });
    return walletAdapter ?? null;
  }

  public getActiveWalletAddress(
    options: { chainType?: ChainType; walletName?: WALLET_NAME; blockchain?: BlockchainName } = {}
  ): string | null {
    const walletAdapter = this.getActiveProvider(options);
    return walletAdapter?.address ?? null;
  }

  // public readonly networkChange$ = this.networkChangeSubject$.asObservable();

  // public readonly addressChange$: Observable<AddressChangedMsg | null> =
  //   this.addressChangeSubject$.asObservable();

  public readonly networkChange$: Observable<BlockchainName>;

  public readonly addressChange$: Observable<AddressChangedMsg>;

  constructor(
    private readonly storeService: StoreService,
    private readonly errorService: ErrorsService,
    private readonly httpService: HttpService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    private readonly zone: NgZone,
    private readonly modalsService: ModalService
  ) {
    this.walletAdapterFactory = new WalletAdapterFactory(
      storeService,
      errorService,
      httpService,
      zone,
      window
    );
    this.walletsManager = new WalletsManager();
    this.activeWallets$ = this.walletsManager.activeWallets$;
    this.networkChange$ = this.walletAdapterFactory.networkChange$;
    this.addressChange$ = this.walletAdapterFactory.addressChange$;
  }

  public checkIfSafeEnv(): boolean {
    const params = new URLSearchParams(this.window.location.search);
    return params.has('useSafe') ? params.get('useSafe') === 'true' : false;
  }

  /**
   * Setups provider based on local storage.
   */
  public async setupProviders(): Promise<boolean> {
    const isSafeEnv = this.checkIfSafeEnv();
    console.info('isSafeEnv: ', isSafeEnv);

    const providers = this.storeService.getItem('RUBIC_PROVIDERS');
    if ((!providers || !providers.length) && !isSafeEnv) {
      return false;
    }

    if (isSafeEnv) {
      this.connectProvider(WALLET_NAME.SAFE);
      const walletAdapter = this.getActiveProvider({ walletName: WALLET_NAME.SAFE });
      this.activate(walletAdapter);
    } else {
      providers.forEach(provider => {
        this.connectProvider(provider);
        const walletAdapter = this.getActiveProvider({ walletName: provider });
        this.activate(walletAdapter);
      });
    }

    return true;
  }

  public connectProvider(walletName: WALLET_NAME, chainId?: number): void {
    const walletAdapter = this.walletAdapterFactory.createWalletAdapter(
      walletName,
      this.isIos,
      chainId || this._selectedChainId
    );
    const sameChainWallet = this.activeWallets.find(
      wallet => wallet.chainType === walletAdapter.chainType
    );
    if (sameChainWallet) {
      this.deactivate(sameChainWallet.walletName);
    }
    this.walletsManager.addWallet(walletAdapter);
  }

  public async activate(provider: CommonWalletAdapter): Promise<void> {
    await provider.activate();
    if (
      provider.walletName !== WALLET_NAME.SAFE &&
      provider.walletName !== WALLET_NAME.TON_CONNECT
    ) {
      const providers = this.activeWallets.map(wallet => wallet.walletName);
      this.storeService.setItem('RUBIC_PROVIDERS', providers);
    }
  }

  public deactivate(walletName: WALLET_NAME): void {
    const walletAdapter = this.getActiveProvider({ walletName });
    if (!walletAdapter) return;

    this.walletsManager.removeWallet(walletAdapter);
    walletAdapter.deactivate();

    const providers = this.activeWallets.map(wallet => wallet.walletName);
    if (providers.length) {
      this.storeService.setItem('RUBIC_PROVIDERS', providers);
    } else {
      this.storeService.deleteItem('RUBIC_PROVIDERS');
    }
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
    const provider = this.getActiveProvider({ chainType: 'EVM' });

    if (!(provider instanceof EvmWalletAdapter)) {
      throw new RubicError("Can't switch chain in non evm wallet!");
    }
    const chainId = `0x${blockchainId[evmBlockchainName].toString(16)}`;

    try {
      await provider.switchChain(chainId);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await this.addChain(evmBlockchainName, customRpcUrl);
          await provider.switchChain(chainId);
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
        provider instanceof HoldstationWalletAdapter
      ) {
        const reconnect = await firstValueFrom(
          this.modalsService.openWcChangeNetworkModal(provider.network, evmBlockchainName)
        );

        if (reconnect) {
          try {
            await provider.deactivate();
            const decimalId = parseInt(chainId, 16);
            await provider.updateDefaultChain(decimalId);
            await provider.activate();
          } catch (err) {
            await provider.deactivate();
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
    const provider = this.getActiveProvider({ chainType: 'EVM' });
    const params = this.getRpcParams(evmBlockchainName, customRpcUrl);
    await (provider as EvmWalletAdapter).addChain(params);
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
