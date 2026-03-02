import { Injectable } from '@angular/core';
import { HttpService } from '@app/core/services/http/http.service';
import { Cache as Memo } from '@cryptorubic/core';
import { waitFor } from '@cryptorubic/web3';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { firstValueFrom } from 'rxjs';

interface JupiterSwapBuildTxResp {
  success: boolean;
  orderResponse: JupiterSwapBuildTxSuccessResp;
}

export type JupiterSwapBuildTxSuccessResp = {
  error?: string;
  /**
   * destination token amount after swap
   */
  outAmount: string;
  /**
   * base64 data
   */
  transaction: string;
  requestId: string;
};

export interface JupiterSwapSendTxResp {
  success: boolean;
  exeRes: { signature: string };
}

export interface PrivacyCashFeesResp {
  withdraw_fee_rate: number;
  withdraw_rent_fee: number;
  deposit_fee_rate: number;
  rent_fees: {
    [tokenSymbol: string]: number;
  };
  minimum_withdrawal: {
    [tokenSymbol: string]: number;
  };
  prices: {
    [tokenSymbol: string]: number;
  };
  usdc_withdraw_rent_fee: number;
}

@Injectable()
export class PrivacyCashApiService {
  private readonly apiUrl: string = 'https://api3.privacycash.org/swap';

  constructor(private readonly httpService: HttpService) {}

  @Memo({ maxAge: 10 * 60_000 })
  public async fetchFees(): Promise<PrivacyCashFeesResp> {
    return firstValueFrom(
      this.httpService.get<PrivacyCashFeesResp>('', {}, 'https://api3.privacycash.org/config')
    );
  }

  public async jupSwap(
    inputMint: PublicKey,
    outputMint: PublicKey,
    base_unites: number,
    burnerKeypair: Keypair
  ): Promise<JupiterSwapBuildTxSuccessResp> {
    console.debug('[RUBIC] buildSwapTx params', {
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      base_unites,
      burnerKeypair: burnerKeypair.publicKey.toString()
    });
    const orderResponse: JupiterSwapBuildTxSuccessResp = await this.buildSwapTx(
      base_unites,
      inputMint.toString(),
      outputMint.toString(),
      burnerKeypair.publicKey.toString()
    );

    const transaction = VersionedTransaction.deserialize(
      Buffer.from(orderResponse.transaction, 'base64')
    );

    transaction.sign([burnerKeypair]);
    const signedTxBase64 = Buffer.from(transaction.serialize()).toString('base64');

    console.debug('[RUBIC] makeSwapTx params', {
      signedTxBase64,
      requestId: orderResponse.requestId,
      burnerKeypair: burnerKeypair.publicKey.toString()
    });
    const makeSwapResp = await this.makeSwapTx(
      signedTxBase64,
      orderResponse.requestId,
      burnerKeypair
    );
    console.debug('[RUBIC] jupSwap_makeSwapTx resp', makeSwapResp);

    return orderResponse;
  }

  public async buildSwapTx(
    srcAmountWei: number,
    inputMint: string,
    outputMint: string,
    takerAddress: string
  ): Promise<JupiterSwapBuildTxSuccessResp> {
    try {
      let retryCount = 0;
      while (true) {
        const buildTxResp = await firstValueFrom(
          this.httpService.post<JupiterSwapBuildTxResp>(
            '',
            {
              step: 'build_tx',
              baseUnites: Math.floor(srcAmountWei),
              inputMint,
              outputMint,
              taker: takerAddress
            },
            this.apiUrl
          )
        );
        if (buildTxResp.success && buildTxResp.orderResponse?.outAmount) {
          return buildTxResp.orderResponse;
        }

        console.debug('[PrivacyCashApiService_buildSwapTx] error', buildTxResp);
        if (retryCount < 2) {
          retryCount++;
        } else {
          throw new Error();
        }
      }
    } catch (err) {
      return { requestId: '', transaction: '', outAmount: '0' };
    }
  }

  public async makeSwapTx(
    signedTransaction: string,
    requestId: string,
    burnerKeypair: Keypair
  ): Promise<string> {
    const sendTxResp = await firstValueFrom(
      this.httpService.post<JupiterSwapSendTxResp>(
        '',
        {
          step: 'send_tx',
          requestId,
          signedTransaction,
          taker: burnerKeypair.publicKey.toString()
        },
        this.apiUrl
      )
    );

    if (!sendTxResp.success) {
      await waitFor(1_000);
      console.debug('[RUBIC] RETRYING sendTxResp...');
      return this.makeSwapTx(signedTransaction, requestId, burnerKeypair);
    }

    console.debug('[RUBIC] sendTxResp success', sendTxResp);

    return sendTxResp.exeRes.signature;
  }
}
