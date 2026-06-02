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
import { loadWeb3AuthModalSdk, Web3AuthInstance, Web3AuthProvider } from './web3-auth-sdk.loader';

/** Minimum maxPriorityFeePerGas (wei) accepted by ERC-4337 bundlers (e.g. Pimlico). */
const MIN_USER_OP_PRIORITY_FEE_WEI = 200_000n;

const WEB3AUTH_CLIENT_ID =
  'BE7hyL9PhNUWg3RFioapzHPOOttJqSQErwTlgblC1GQ4EZcDRmKbqALCcpGpcvenD636ZJP8N-XGWbp_fV-1O8s';

// const WEB3AUTH_CHAINS = [
//   {
//     chainNamespace: 'eip155',
//     chainId: '0x1',
//     rpcTarget: rpcList[BLOCKCHAIN_NAME.ETHEREUM][0],
//     displayName: defaultBlockchainData[BLOCKCHAIN_NAME.ETHEREUM]?.name ?? 'Ethereum Mainnet',
//     blockExplorerUrl: 'https://etherscan.io',
//     ticker: 'ETH',
//     tickerName: 'Ethereum',
//     logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
//   },
//   {
//     chainNamespace: 'solana',
//     chainId: '0x65',
//     rpcTarget: rpcList[BLOCKCHAIN_NAME.SOLANA][0],
//     displayName: 'Solana Mainnet',
//     blockExplorerUrl: 'https://explorer.solana.com',
//     ticker: 'SOL',
//     tickerName: 'Solana',
//     logo: 'https://cryptologos.cc/logos/solana-sol-logo.png'
//   }
// ];

type UserOpGasTier = {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

type UserOpGasPriceResponse = {
  slow?: UserOpGasTier;
  standard?: UserOpGasTier;
  fast?: UserOpGasTier;
};

type GasField = string | number | bigint | undefined | null;

function toBigInt(value: GasField): bigint {
  if (value === undefined || value === null) {
    return 0n;
  }
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number') {
    return BigInt(value);
  }
  return BigInt(value.startsWith('0x') ? value : value);
}

function weiToHex(wei: bigint): string {
  return `0x${wei.toString(16)}`;
}

function weiStringToHex(wei: string): string {
  return weiToHex(BigInt(wei));
}

function hexOrDecimalToWeiString(value: string): string {
  return BigInt(value.startsWith('0x') ? value : value).toString();
}

export class Web3AuthWalletAdapter extends CommonWalletAdapter {
  private web3Auth: Web3AuthInstance | null = null;

  private rawEvmProvider: Web3AuthProvider | null = null;

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
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
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
        this.rawEvmProvider = provider;
        this.wallet = this.wrapEvmProviderForSmartAccount(provider);

        const client = createWalletClient({ transport: custom(this.wallet) });
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

      this.onNetworkChanges$.next(this.selectedChain);
      this.onAddressChanges$.next(this.selectedAddress);
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
    this.rawEvmProvider = null;
    this.initialized = false;
  }

  /**
   * Gas prices for ERC-4337 user operations (required by Web3Auth smart accounts).
   */
  public async getUserOperationGasPrice(): Promise<{
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
  } | null> {
    if (!this.rawEvmProvider || this.chainType !== CHAIN_TYPE.EVM) {
      return null;
    }

    try {
      const result = (await this.rawEvmProvider.request({
        method: 'pimlico_getUserOperationGasPrice',
        params: []
      })) as UserOpGasPriceResponse;

      const tier = result?.fast ?? result?.standard ?? result?.slow;
      if (!tier?.maxFeePerGas || !tier?.maxPriorityFeePerGas) {
        return null;
      }

      return {
        maxFeePerGas: hexOrDecimalToWeiString(tier.maxFeePerGas),
        maxPriorityFeePerGas: hexOrDecimalToWeiString(tier.maxPriorityFeePerGas)
      };
    } catch {
      return null;
    }
  }

  private wrapEvmProviderForSmartAccount(provider: Web3AuthProvider): Web3AuthProvider {
    return {
      request: async (args: { method: string; params?: unknown[] }) => {
        if (args.method === 'eth_sendTransaction' && Array.isArray(args.params) && args.params[0]) {
          const tx = { ...(args.params[0] as Record<string, unknown>) };
          const priorityFee = toBigInt(tx.maxPriorityFeePerGas as GasField);

          if (priorityFee < MIN_USER_OP_PRIORITY_FEE_WEI) {
            const userOpGas = await this.getUserOperationGasPrice();
            if (userOpGas) {
              tx.maxPriorityFeePerGas = weiStringToHex(userOpGas.maxPriorityFeePerGas);
              tx.maxFeePerGas = weiStringToHex(userOpGas.maxFeePerGas);
            } else {
              tx.maxPriorityFeePerGas = weiToHex(MIN_USER_OP_PRIORITY_FEE_WEI);
              const maxFee = toBigInt(tx.maxFeePerGas as GasField);
              if (maxFee < MIN_USER_OP_PRIORITY_FEE_WEI) {
                tx.maxFeePerGas = weiToHex(MIN_USER_OP_PRIORITY_FEE_WEI * 2n);
              }
            }
          }

          return provider.request({ ...args, params: [tx, ...args.params.slice(1)] });
        }

        return provider.request(args);
      }
    };
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
