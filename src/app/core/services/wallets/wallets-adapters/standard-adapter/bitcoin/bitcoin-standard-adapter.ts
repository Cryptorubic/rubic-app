import { StandardAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/standard-adapter';
import { FeaturesWallet } from '@core/services/wallets/wallets-adapters/standard-adapter/models/features-wallet';
import { BitcoinStandardFeatures } from './models/bitcoin-features';
import { StandardConnectOutput } from '@wallet-standard/features';
import { BitcoinSignTransactionOutput } from './models/features/signTransaction';
import { BtcWallet } from '@cryptorubic/web3';

export class BitcoinStandardAdapter
  extends StandardAdapter<BitcoinStandardFeatures>
  implements BtcWallet
{
  constructor(wallet: FeaturesWallet<BitcoinStandardFeatures>) {
    super(wallet);
  }

  public async request<T>(args: {
    method: string;
    params: { psbt: string; signInputs: { [key: string]: number[] } }[];
  }): Promise<{ error: null | Error; result: T }> {
    if (args.method === 'sign_psbt' && args.params?.length > 0) {
      const psbt = args.params[0].psbt;

      const walletAddress = Object.keys(args.params[0].signInputs)?.[0];
      const signingIndexes = args.params[0].signInputs[walletAddress];
      const result = await this.signTransaction(psbt, signingIndexes);
      return result as unknown as { error: null | Error; result: T };
    }
    throw new Error(`Unsupported method: ${args.method}`);
  }

  public async signTransaction(
    psbtBase64: string,
    signingIndexes: number[]
  ): Promise<BitcoinSignTransactionOutput> {
    try {
      const account = this.wallet.accounts[0];
      const result = await this.wallet.features['bitcoin:signTransaction'].signTransaction({
        psbt: new Uint8Array(Buffer.from(psbtBase64, 'base64')),
        inputsToSign: [
          {
            account: account,
            signingIndexes: signingIndexes,
            sigHash: 'ALL'
          }
        ],
        chain: 'bitcoin:mainnet'
      });
      return result[0];
    } catch (err) {
      throw err;
    }
  }

  protected override async useConnectFeature(): Promise<StandardConnectOutput> {
    return this.wallet.features['bitcoin:connect']?.connect({
      purposes: ['payment']
    });
  }

  protected override async useDisconnectFeature(): Promise<void> {
    await this.wallet.features['bitcoin:disconnect']?.disconnect?.();
  }
}
