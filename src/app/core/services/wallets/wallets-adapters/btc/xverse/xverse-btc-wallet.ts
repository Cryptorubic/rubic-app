import { BtcWallet } from '@cryptorubic/web3';
import {
  BtcRpcArguments,
  BtcRpcResponse
} from 'node_modules/@cryptorubic/web3/src/lib/adapter/adapters/adapter-bitcoin/models/btc-request-types';
import { request } from 'sats-connect';

export class XverseBtcWallet implements BtcWallet {
  constructor(private readonly publicKey: string) {}

  public on(): unknown {
    throw new Error('[XverseBtcWallet_on] Method not implemented!');
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
      return { result: [{ publicKey: this.publicKey }], error: null };
    }

    // @ts-ignore
    throw new Error(`[XverseBtcWallet_request] Method ${args.method} not implemented.`);
  }
}
