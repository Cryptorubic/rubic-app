import { StandardAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/standard-adapter';
import { FeaturesWallet } from '@core/services/wallets/wallets-adapters/standard-adapter/models/features-wallet';
import { BitcoinStandardFeatures } from './models/bitcoin-features';
import { StandardConnectOutput } from '@wallet-standard/features';
import { BtcWallet } from '@cryptorubic/web3';
import { HttpService } from '@app/core/services/http/http.service';
import { firstValueFrom } from 'rxjs';
import { Psbt } from 'bitcoinjs-lib';

export class BitcoinStandardAdapter
  extends StandardAdapter<BitcoinStandardFeatures>
  implements BtcWallet
{
  public get publicKey(): string {
    return Buffer.from(this.wallet.accounts[0].publicKey).toString('hex');
  }

  constructor(wallet: FeaturesWallet<BitcoinStandardFeatures>, private httpService: HttpService) {
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
      const signedPsbtHex = await this.signTransaction(psbt, signingIndexes);
      const txHash = await this.sendTransaction(signedPsbtHex);

      return { result: txHash } as { error: null | Error; result: T };
    }
    if (args.method === 'request_accounts_and_keys') {
      console.log(this.publicKey);
      return { result: [{ publicKey: this.publicKey }] } as { error: null | Error; result: T };
    }

    throw new Error(`Unsupported method: ${args.method}`);
  }

  protected override async useConnectFeature(): Promise<StandardConnectOutput> {
    return this.wallet.features['bitcoin:connect']?.connect({
      purposes: ['payment']
    });
  }

  protected override async useDisconnectFeature(): Promise<void> {
    await this.wallet.features['bitcoin:disconnect']?.disconnect?.();
  }

  private async signTransaction(psbtBase64: string, signingIndexes: number[]): Promise<string> {
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

      const signedPsbt = Psbt.fromBuffer(result[0].signedPsbt);
      signedPsbt.finalizeAllInputs();
      const signedPsbtHex = signedPsbt.extractTransaction().toHex();

      return signedPsbtHex;
    } catch (err) {
      throw err;
    }
  }

  private async sendTransaction(signedPsbtHex: string): Promise<string> {
    try {
      const url = `https://api.blockcypher.com/v1/btc/main/txs/push`;
      const { hash } = await firstValueFrom(
        this.httpService.post<{ hash: string }>('', { tx: signedPsbtHex }, url)
      );

      return hash;
    } catch (err) {
      throw err;
    }
  }
}
