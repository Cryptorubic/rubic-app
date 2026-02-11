import { Injectable } from '@angular/core';
import { waitFor } from '@cryptorubic/web3';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';

const swapAgentUrl = 'https://api3.privacycash.org/swap';

export type JupSwapResp = {
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

@Injectable({
  providedIn: 'root'
})
export class JupiterSwapService {
  constructor() {}

  public async jupSwap(
    inputMint: PublicKey,
    outputMint: PublicKey,
    base_unites: number,
    burnerKeypair: Keypair
  ): Promise<JupSwapResp> {
    console.debug('[RUBIC] buildSwapTx params', {
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      base_unites,
      burnerKeypair: burnerKeypair.publicKey.toString()
    });
    let orderResponse: JupSwapResp = await this.buildSwapTx(
      base_unites,
      inputMint.toString(),
      outputMint.toString(),
      burnerKeypair.publicKey.toString()
    );

    const transaction = VersionedTransaction.deserialize(
      Buffer.from(orderResponse.transaction, 'base64')
    );

    // sign tx
    transaction.sign([burnerKeypair]);
    const signedTxBase64 = Buffer.from(transaction.serialize()).toString('base64');

    console.debug('[RUBIC] makeSwapTx params', {
      signedTxBase64,
      requestId: orderResponse.requestId,
      burnerKeypair: burnerKeypair.publicKey.toString()
    });
    // swap execute
    let makeSwapResp = await this.makeSwapTx(
      signedTxBase64,
      orderResponse.requestId,
      burnerKeypair
    );
    console.debug('[RUBIC] jupSwap_makeSwapTx resp', makeSwapResp);

    // await connection.confirmTransaction(tx, "confirmed");

    return orderResponse;
  }

  // get swap quote
  public async buildSwapTx(
    baseUnites: number,
    inputMint: string,
    outputMint: string,
    takerAddress = ''
  ): Promise<JupSwapResp> {
    if (baseUnites <= 0) {
      throw new Error('baseUnites must be greater than 0');
    }
    let params = {
      step: 'build_tx',
      baseUnites: Math.floor(baseUnites),
      inputMint,
      outputMint,
      taker: takerAddress
    };
    console.debug(`[RUBIC] fetching ${swapAgentUrl} with params:`, params);

    let res = await fetch(swapAgentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    console.debug('got response');

    let json = await res.json();
    if (!json.success || json.orderResponse.error || !json.orderResponse.outAmount) {
      console.debug('[RUBIC] buildSwapTx error', json);
      await waitFor(1_000);
      console.debug('[RUBIC] RETRYING buildSwapTx...');
      return this.buildSwapTx(baseUnites, inputMint, outputMint, takerAddress);
    }

    console.debug('[RUBIC] buildSwapTx success', json.orderResponse);

    return json.orderResponse;
  }

  // make tx
  public async makeSwapTx(
    signedTransaction: string,
    requestId: string,
    burnerKeypair: Keypair
  ): Promise<string> {
    const res = await fetch(swapAgentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        step: 'send_tx',
        requestId,
        signedTransaction,
        taker: burnerKeypair.publicKey.toString()
      })
    });

    const json = await res.json();
    if (!json.success) {
      await waitFor(1_000);
      console.debug('[RUBIC] RETRYING makeSwapTx...');
      return this.makeSwapTx(signedTransaction, requestId, burnerKeypair);
    }

    console.debug('[RUBIC] makeSwapTx success', json);

    return json.exeRes.signature;
  }
}
