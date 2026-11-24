import { BtcWallet, BtcWalletEvent } from '@cryptorubic/web3';
import {
  BtcRpcArguments,
  BtcRpcResponse
} from 'node_modules/@cryptorubic/web3/src/lib/adapter/adapters/adapter-bitcoin/models/btc-request-types';
import { request, addListener, AddListener } from 'sats-connect';
import { XverseAccountsChangedEvent } from './models/xverse-wallet-events';

export class XverseBtcWallet implements BtcWallet {
  private readonly subs: Record<BtcWalletEvent, ReturnType<AddListener>[]> = {
    accountsChanged: []
  };

  private _publicKey: string;

  constructor(publicKey: string) {
    this._publicKey = publicKey;
  }

  public on(eventName: string, callback: (...args: unknown[]) => void) {
    switch (eventName) {
      case 'accountsChanged':
        const unsubFn = addListener('accountChange', (event: XverseAccountsChangedEvent) => {
          const accountData = event.addresses.find(account => account.purpose === 'payment');
          this._publicKey = accountData.publicKey;
          callback(accountData.address);
        });
        this.subs.accountsChanged.push(unsubFn);
        break;
      default:
        throw new Error(`[XverseBtcWallet_on] Event ${eventName} not implemented!`);
    }
  }

  public off(eventName: BtcWalletEvent): void {
    const unsubs = this.subs[eventName];
    unsubs.forEach(unsubFn => unsubFn());
    this.subs[eventName] = [];
  }

  public async request(args: BtcRpcArguments): Promise<{
    error: null | Error;
    result: BtcRpcResponse;
  }> {
    if (args.method === 'sign_psbt') {
      const response = await request('signPsbt', {
        psbt: args.params[0].psbt,
        signInputs: args.params[0].signInputs,
        broadcast: args.params[0].broadcast
      });

      return response.status === 'success'
        ? { error: null, result: { psbt: response.result.psbt, txId: response.result.txid } }
        : { error: response.error as unknown as Error, result: undefined };
    }

    if (args.method === 'transfer') {
      const response = await request('sendTransfer', {
        recipients: [
          {
            address: args.params[0].recipient,
            amount: Number(args.params[0].amount.amount)
          }
        ]
      });

      return response.status === 'success'
        ? { error: null, result: { txId: response.result.txid } }
        : { error: response.error as unknown as Error, result: undefined };
    }

    if (args.method === 'request_accounts_and_keys') {
      return { result: [{ publicKey: this._publicKey }], error: null };
    }

    // @ts-ignore
    throw new Error(`[XverseBtcWallet_request] Method ${args.method} not implemented.`);
  }
}
