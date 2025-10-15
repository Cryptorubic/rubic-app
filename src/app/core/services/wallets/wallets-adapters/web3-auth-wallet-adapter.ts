import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import {
  CHAIN_NAMESPACES,
  IProvider,
  SolanaWallet,
  Web3Auth,
  WEB3AUTH_NETWORK
} from '@web3auth/modal';
import { BLOCKCHAIN_NAME, blockchainId, BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { BlockchainsInfo, ChainType, EvmBlockchainName } from '@cryptorubic/sdk';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { createWalletClient, custom } from 'viem';

export class Web3AuthWalletAdapter extends CommonWalletAdapter<IProvider | SolanaWallet> {
  private readonly web3Auth = new Web3Auth({
    clientId:
      'BE7hyL9PhNUWg3RFioapzHPOOttJqSQErwTlgblC1GQ4EZcDRmKbqALCcpGpcvenD636ZJP8N-XGWbp_fV-1O8s',
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
  });

  private initialized: boolean = false;

  public chainType: ChainType = CHAIN_TYPE.EVM;

  public readonly walletName = WALLET_NAME.WEB3AUTH;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    try {
      if (!this.initialized) {
        await this.web3Auth.init();
        this.initialized = true;
      }

      const provider = await this.web3Auth.connect();

      const currentChain = this.web3Auth.currentChain;

      let address: string;
      let chain: BlockchainName;

      if (currentChain?.chainNamespace === CHAIN_NAMESPACES.SOLANA) {
        const solanaWallet = new SolanaWallet(provider);
        this.wallet = solanaWallet;

        const accounts = await solanaWallet.getAccounts();
        address = accounts?.[0];
        Object.defineProperty(solanaWallet, 'publicKey', {
          value: {
            toString: () => address
          },
          writable: false,
          enumerable: true
        });

        chain = BLOCKCHAIN_NAME.SOLANA;
        this.chainType = CHAIN_TYPE.SOLANA;
      } else if (currentChain?.chainNamespace === CHAIN_NAMESPACES.EIP155) {
        this.wallet = provider;

        const client = createWalletClient({ transport: custom(provider) });
        const accounts = await client.getAddresses();
        address = accounts?.[1] || accounts?.[0];

        chain = BlockchainsInfo.getBlockchainNameById(currentChain?.chainId || 1);
        this.chainType = CHAIN_TYPE.EVM;
      } else {
        throw Error();
      }

      this.isEnabled = true;

      this.selectedAddress = address;
      this.selectedChain = chain;

      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (error) {
      throw new SignRejectError();
      this.deactivate();
    }
  }

  public override deactivate(): void {
    super.deactivate();
    this.web3Auth.logout();
  }

  public async switchChain(
    evmBlockchainName: EvmBlockchainName,
    _customRpcUrl?: string
  ): Promise<boolean> {
    const chainId = `0x${blockchainId[evmBlockchainName].toString(16)}`;

    try {
      await this.web3Auth.switchChain({ chainId });
      this.selectedChain = evmBlockchainName;
      this.onNetworkChanges$.next(this.selectedChain);
      return true;
    } catch (switchError) {
      console.error(switchError);
    }
    return false;
  }
}
