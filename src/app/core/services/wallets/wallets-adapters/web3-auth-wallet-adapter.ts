import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BLOCKCHAIN_NAME, blockchainId, BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { BlockchainsInfo, ChainType, EvmBlockchainName } from '@cryptorubic/core';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { createWalletClient, custom } from 'viem';
import { defaultBlockchainData } from '@core/services/wallets/wallet-connector-service/constants/default-blockchain-data';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { loadWeb3AuthModalSdk, Web3AuthInstance } from './web3-auth-sdk.loader';

const WEB3AUTH_CLIENT_ID =
  'BE7hyL9PhNUWg3RFioapzHPOOttJqSQErwTlgblC1GQ4EZcDRmKbqALCcpGpcvenD636ZJP8N-XGWbp_fV-1O8s';

const WEB3AUTH_CHAINS = [
  {
    chainNamespace: 'eip155',
    chainId: '0x1',
    rpcTarget: rpcList[BLOCKCHAIN_NAME.ETHEREUM][0],
    displayName: defaultBlockchainData[BLOCKCHAIN_NAME.ETHEREUM]?.name ?? 'Ethereum Mainnet',
    blockExplorerUrl: 'https://etherscan.io',
    ticker: 'ETH',
    tickerName: 'Ethereum',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    chainNamespace: 'solana',
    chainId: '0x65',
    rpcTarget: rpcList[BLOCKCHAIN_NAME.SOLANA][0],
    displayName: 'Solana Mainnet',
    blockExplorerUrl: 'https://explorer.solana.com',
    ticker: 'SOL',
    tickerName: 'Solana',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png'
  }
];

export class Web3AuthWalletAdapter extends CommonWalletAdapter {
  private web3Auth: Web3AuthInstance | null = null;

  private initialized = false;

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

  private async getWeb3Auth(): Promise<Web3AuthInstance> {
    if (!this.web3Auth) {
      const { Web3Auth, WEB3AUTH_NETWORK } = await loadWeb3AuthModalSdk();
      this.web3Auth = new Web3Auth({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        defaultChainId: '0x1',
        chains: [...WEB3AUTH_CHAINS]
      });
    }
    return this.web3Auth;
  }

  public async activate(): Promise<void> {
    try {
      const web3Auth = await this.getWeb3Auth();
      const { CHAIN_NAMESPACES, SolanaWallet } = await loadWeb3AuthModalSdk();

      if (!this.initialized) {
        await web3Auth.init();
        this.initialized = true;
      }

      const provider = await web3Auth.connect();
      if (!provider) {
        throw new SignRejectError();
      }

      const currentChain = web3Auth.currentChain;

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
        address = accounts?.[0];

        chain = BlockchainsInfo.getBlockchainNameById(currentChain?.chainId || 1);
        this.chainType = CHAIN_TYPE.EVM;
      } else {
        throw new Error('Unsupported Web3Auth chain');
      }

      if (!address) {
        throw new Error('Web3Auth returned no account');
      }

      this.isEnabled = true;

      this.selectedAddress = address;
      this.selectedChain = chain;

      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (error) {
      this.deactivate();
      if (error instanceof SignRejectError) {
        throw error;
      }
      throw new SignRejectError();
    }
  }

  public override deactivate(): void {
    super.deactivate();
    void this.web3Auth?.logout();
    this.web3Auth = null;
    this.initialized = false;
  }

  public async switchChain(
    evmBlockchainName: EvmBlockchainName,
    _customRpcUrl?: string
  ): Promise<boolean> {
    const chainId = `0x${blockchainId[evmBlockchainName].toString(16)}`;

    try {
      const web3Auth = await this.getWeb3Auth();
      await web3Auth.switchChain({ chainId });
      this.selectedChain = evmBlockchainName;
      this.onNetworkChanges$.next(this.selectedChain);
      return true;
    } catch (switchError) {
      console.error(switchError);
    }
    return false;
  }
}
