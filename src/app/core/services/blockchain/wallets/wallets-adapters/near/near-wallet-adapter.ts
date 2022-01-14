import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';

import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';
import { connect, WalletConnection } from 'near-api-js';
import { NEAR_TESTNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { RubicWindow } from '@shared/utils/rubic-window';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { WALLET_NAME } from '@app/core/wallets/components/wallets-modal/models/wallet-name';

export class NearWalletAdapter extends CommonWalletAdapter<WalletConnection> {
  public get walletType(): BlockchainType {
    return 'near';
  }

  public get network(): BlockchainData {
    if (!this.isActive) {
      return null;
    }
    return BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.NEAR);
  }

  public get isMultiChainWallet(): boolean {
    return false;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.NEAR;
  }

  constructor(
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    private readonly window: RubicWindow
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$);
  }

  public async signPersonal(message: string): Promise<string> {
    console.log(message);
    return null;
  }

  public async activate(): Promise<void> {
    const near = await connect(NEAR_TESTNET_CONFIG);
    const wallet = new WalletConnection(near, 'rubic');

    if (!wallet.isSignedIn()) {
      const successUrl = new URL(this.window.location.href);
      successUrl.searchParams.set('nearLogin', 'true');
      await wallet.requestSignIn('example-contract.testnet', 'rubic', successUrl.href);
    } else {
      this.isEnabled = true;
      this.wallet = wallet;
      this.selectedAddress = wallet.account().accountId;
      this.selectedChain = 'testnet';

      this.onNetworkChanges$.next(this.getNetwork());
      this.onAddressChanges$.next(this.selectedAddress);
    }

    // const tokenAccount = await near.account('banana.ft-fin.testnet');
    // const balance = await tokenAccount.getAccountBalance();
    // debugger;

    // wallet.account().getAccountBalance()
    // const test = await wallet.account().state();
    // debugger;

    // wallet.account().viewFunction(REF_FI_CONTRACT_ID, methodName, args);
    //
    // {
    //   methodName: 'get_deposit',
    //     args: { account_id: wallet.getAccountId(), token_id: tokenId },
    // }

    // const balance = await wallet.account().getAccountBalance();
    // const info = await wallet.account().getAccountDetails();
  }

  public async deActivate(): Promise<void> {
    if (this.wallet?.isSignedIn()) {
      this.wallet.signOut();
    }
  }

  public async addChain(): Promise<null> {
    return null;
  }

  public async switchChain(): Promise<null> {
    return null;
  }

  public async addToken(): Promise<void> {
    return;
  }

  // private async requestSignIn(
  //   wallet: WalletConnection,
  //   contractId?: string,
  //   successUrl?: string,
  //   failureUrl?: string
  // ): Promise<void> {
  //   const options = {
  //     contractId,
  //     successUrl,
  //     failureUrl
  //   };
  //   const currentUrl = new URL(window.location.href);
  //   const newUrl = new URL(`${wallet._walletBaseUrl}/login/`);
  //   newUrl.searchParams.set('success_url', options.successUrl || currentUrl.href);
  //   newUrl.searchParams.set('failure_url', options.failureUrl || currentUrl.href);
  //
  //   if (options.contractId) {
  //     /* Throws exception if contract account does not exist */
  //     const contractAccount = await wallet._near.account(options.contractId);
  //     await contractAccount.state();
  //     newUrl.searchParams.set('contract_id', options.contractId);
  //     const accessKey = KeyPair.fromRandom('ed25519');
  //     newUrl.searchParams.set('public_key', accessKey.getPublicKey().toString());
  //     const PENDING_ACCESS_KEY_PREFIX = 'pending_key';
  //     await wallet._keyStore.setKey(
  //       wallet._networkId,
  //       PENDING_ACCESS_KEY_PREFIX + accessKey.getPublicKey(),
  //       accessKey
  //     );
  //   }
  //
  //   const hash = await new Promise<string>((resolve, reject) => {
  //     const tab = this.window.open(newUrl.toString());
  //     // tab.addEventListener('click', event => {
  //     //   debugger;
  //     //   resolve('');
  //     // });
  //     // debugger;
  //     tab.window.onload = e => {
  //       console.log(e);
  //       debugger;
  //     };
  //
  //     // tab.window.addEventListener('click', () => {
  //     //   debugger;
  //     //   resolve('');
  //     // });
  //     // tab.window.onbeforeunload = () => {
  //     //   debugger;
  //     //   reject('Tab has been closed');
  //     // };
  //   });
  // }
}
