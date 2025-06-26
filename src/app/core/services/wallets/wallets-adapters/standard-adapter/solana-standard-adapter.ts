import { SolanaWeb3 } from '@cryptorubic/web3';
import {
  Connection,
  Transaction,
  TransactionSignature,
  VersionedTransaction
} from '@solana/web3.js';

import bs58 from 'bs58';
import { SolanaStandardFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/solana-features';
import { StandardAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/standard-adapter';
import { FeaturesWallet } from '@core/services/wallets/wallets-adapters/standard-adapter/models/features-wallet';

export class SolanaStandardAdapter
  extends StandardAdapter<SolanaStandardFeatures>
  implements SolanaWeb3
{
  constructor(wallet: FeaturesWallet<SolanaStandardFeatures>) {
    super(wallet);
  }

  public async signTransaction(tx: Transaction): Promise<Transaction> {
    const account = this.wallet.accounts[0];

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    const [signed] = await this.wallet.features['solana:signTransaction'].signTransaction({
      transaction: serialized,
      account,
      chain: 'solana:mainnet'
    });

    return Transaction.from(signed.signedTransaction);
  }

  async signAllTransactions(_txs: Transaction[]): Promise<Transaction[]> {
    throw new Error('Not implemented');
  }

  async signMessage(message: Uint8Array, _encoding: string): Promise<{ signature: Uint8Array }> {
    const account = this.wallet.accounts[0];
    const [result] = await this.wallet.features['solana:signMessage'].signMessage({
      account,
      message
    });
    return { signature: result.signature };
  }

  async sendTransaction(tx: Transaction, connection?: Connection): Promise<TransactionSignature> {
    const raw = tx.serialize();
    return connection!.sendRawTransaction(raw);
  }

  async signAndSendTransaction(
    tx: Transaction | VersionedTransaction
  ): Promise<{ signature: string }> {
    const account = this.wallet.accounts[0];
    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    const [result] = await this.wallet.features[
      'solana:signAndSendTransaction'
    ].signAndSendTransaction({
      account,
      transaction: serialized,
      chain: 'solana:mainnet'
    });

    return { signature: bs58.encode(result.signature) };
  }

  async request<T>(args: { method: string; params: { message: string } }): Promise<T> {
    if (args.method === 'signMessage') {
      const msg = new TextEncoder().encode(args.params.message);
      const result = await this.signMessage(msg, 'utf8');
      return result as unknown as T;
    }
    throw new Error(`Unsupported method: ${args.method}`);
  }
}
