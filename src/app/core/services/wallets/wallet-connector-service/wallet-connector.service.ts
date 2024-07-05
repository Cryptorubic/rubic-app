import { Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { MetamaskWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/metamask-wallet-adapter';
import { WalletConnectAdapter } from '@core/services/wallets/wallets-adapters/evm/wallet-connect-adapter';
import { WalletLinkWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/wallet-link-wallet-adapter';
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
import { BitkeepWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/bitkeep-wallet-adapter';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';
import { PhantomWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/phantom-wallet-adapter';
import { SolflareWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/solflare-wallet-adapter';
import { SafeWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/safe-wallet-adapter';
import { TokenPocketWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/token-pocket-wallet-adapter';
import { TonConnectAdapter } from '../wallets-adapters/ton/ton-connect-adapter';

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
    private readonly zone: NgZone
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
    this.privateProvider = this.createWalletAdapter(walletName, chainId);
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

    if (walletName === WALLET_NAME.BITKEEP) {
      return new BitkeepWalletAdapter(...defaultConstructorParameters);
    }

    if (walletName === WALLET_NAME.WALLET_LINK) {
      return new WalletLinkWalletAdapter(
        ...defaultConstructorParameters,
        this.storeService,
        chainId!
      );
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
      return new TonConnectAdapter(...defaultConstructorParameters);
    }

    this.errorService.catch(new WalletNotInstalledError());
  }

  public async activate(): Promise<void> {
    await this.provider.activate();
    if (this.provider.walletName !== WALLET_NAME.SAFE) {
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
    const chainId = `0x${blockchainId[evmBlockchainName].toString(16)}`;
    const provider = this.provider as EvmWalletAdapter;
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
