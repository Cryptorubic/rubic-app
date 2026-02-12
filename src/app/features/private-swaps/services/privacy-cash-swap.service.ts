import { Injectable } from '@angular/core';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BLOCKCHAIN_NAME, Token, nativeTokensList } from '@cryptorubic/core';
import {
  WRAP_SOL_ADDRESS,
  addr_to_symbol_map,
  swap_reserved_rent_fee
} from '../constants/privacycash-consts';

import {
  deposit,
  depositSPL,
  withdraw,
  withdrawSPL,
  EncryptionService,
  getUtxos,
  getBalanceFromUtxos,
  getUtxosSPL,
  getBalanceFromUtxosSPL
} from 'privacycash/utils';
import { Connection, Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { WasmFactory, LightWasm } from '@lightprotocol/hasher.rs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { WalletNotConnectedError, waitFor } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { JupiterSwapService } from './jupiter-swap.service';
import { compareAddresses } from '@app/shared/utils/utils';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { toRubicTokenAddr } from '../utils/converter';

@Injectable()
export class PrivacyCashSwapService {
  private readonly encryptionService: EncryptionService;

  private readonly _signature$ = new BehaviorSubject<Uint8Array | null>(null);

  public readonly signature$ = this._signature$.asObservable();

  private get signature(): Uint8Array | null {
    return this._signature$.value;
  }

  private lightWasm: LightWasm;

  constructor(
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly tokensFacadeService: TokensFacadeService,
    private readonly jupiterSwapService: JupiterSwapService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly notificationsService: NotificationsService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.encryptionService = new EncryptionService();
    WasmFactory.getInstance().then(wasmFactory => (this.lightWasm = wasmFactory));

    this.subscribeOnWalletChange();
  }

  private subscribeOnWalletChange(): void {
    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._signature$.next(null);
    });
  }

  public async makeSwapOrTransfer(
    srcAmountNonWei: BigNumber,
    srcTokenAddr: string,
    dstTokenAddr: string,
    receiverAddr: string
  ): Promise<void> {
    await this.checkRequirements();

    const srcToken = this.tokensFacadeService.findTokenSync({
      address: srcTokenAddr === WRAP_SOL_ADDRESS ? nativeTokensList.SOLANA.address : srcTokenAddr,
      blockchain: BLOCKCHAIN_NAME.SOLANA
    });
    if (!srcToken) {
      throw new Error(
        `[PrivacyCashSwapService_makeSwapOrTransfer] findTokenSync call: src token ${srcTokenAddr} not found`
      );
    }
    const dstToken = this.tokensFacadeService.findTokenSync({
      address: dstTokenAddr === WRAP_SOL_ADDRESS ? nativeTokensList.SOLANA.address : dstTokenAddr,
      blockchain: BLOCKCHAIN_NAME.SOLANA
    });
    if (!dstToken) {
      throw new Error(
        `[PrivacyCashSwapService_makeSwapOrTransfer] findTokenSync call: dst token ${dstTokenAddr} not found`
      );
    }

    const srcAmountWei = new BigNumber(Token.toWei(srcAmountNonWei, srcToken.decimals));

    const prices = await fetch('https://api3.privacycash.org/config')
      .then(r => r.json())
      .then(data => data.prices as Record<string, number>);

    const srcTokenUsdPricePerOne = prices[addr_to_symbol_map[srcTokenAddr]];
    const srcTokenUsdAmount = srcTokenUsdPricePerOne * Number(srcAmountNonWei);

    console.debug('[RUBIC] srcTokenUsdAmount ==>', srcTokenUsdAmount);

    if (
      !compareAddresses(srcTokenAddr, dstTokenAddr) &&
      srcAmountWei.gt(0) &&
      srcTokenUsdAmount < 10
    ) {
      throw new Error('Amount should be more than 10$ for swap.');
    }

    const wallet = this.walletConnectorService.provider.wallet;
    const walletPK = new PublicKey(wallet.publicKey.toBytes());

    this.notificationsService.showInfo(`Hiding tokens...`);

    /**
     * If srcAmount passed as 0 => allow user to swap existing balance without new deposit
     */
    if (srcAmountWei.gt(0)) {
      await this.makeDeposit(
        srcTokenAddr,
        srcAmountWei.toNumber(),
        walletPK,
        async (tx: VersionedTransaction) => {
          return await wallet.signTransaction(tx);
        }
      );
    }

    if (compareAddresses(srcTokenAddr, dstTokenAddr)) {
      await this.makeFullWithdraw(srcTokenAddr, walletPK, new PublicKey(receiverAddr));
    } else {
      await this.makeSwapAndWithdraw(
        { ...srcToken, address: srcTokenAddr },
        { ...dstToken, address: dstTokenAddr },
        receiverAddr,
        this.signature
      );
    }
  }

  public async makeDeposit(
    tokenAddr: string,
    depositAmountWei: number,
    depositorWalletPK: PublicKey,
    transactionSignerFn: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<void> {
    await this.checkRequirements();

    const lightWasm = this.lightWasm;
    const encryptionService = this.encryptionService;
    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;
    const pathToZkProof = 'assets/circuit2/transaction2';

    try {
      console.debug(`[RUBIC] Start deposit ${tokenAddr}...`);
      if (tokenAddr === WRAP_SOL_ADDRESS) {
        await deposit({
          lightWasm,
          amount_in_lamports: depositAmountWei,
          connection,
          encryptionService,
          publicKey: depositorWalletPK,
          signer: depositorWalletPK,
          transactionSigner: transactionSignerFn,
          keyBasePath: pathToZkProof,
          storage: localStorage
        });
      } else {
        await depositSPL({
          lightWasm,
          base_units: depositAmountWei,
          connection,
          encryptionService,
          publicKey: depositorWalletPK,
          signer: depositorWalletPK,
          transactionSigner: transactionSignerFn,
          keyBasePath: pathToZkProof,
          storage: localStorage,
          mintAddress: tokenAddr
        });
      }
      console.debug('[RUBIC] ✅ Successfull deposit!');
    } catch (err) {
      console.debug('[RUBIC] ❌ Failed deposit!');
      throw err;
    }
  }

  public async makePartialWithdraw(
    tokenAddr: string,
    withdrawAmountWei: number,
    srcWalletPK: PublicKey,
    recipientPK: PublicKey
  ): Promise<void> {
    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;
    const encryptionService = this.encryptionService;

    console.debug(`[RUBIC] ${tokenAddr} private balance to withdraw:`, {
      withdrawAmountWei,
      srcWallet: srcWalletPK.toBase58(),
      recipientWallet: recipientPK.toBase58()
    });

    const lightWasm = this.lightWasm;
    const pathToZkProof = 'assets/circuit2/transaction2';

    try {
      console.debug('[RUBIC] Start withdraw...');
      if (tokenAddr === WRAP_SOL_ADDRESS) {
        await withdraw({
          lightWasm,
          amount_in_lamports: withdrawAmountWei,
          connection,
          encryptionService,
          publicKey: srcWalletPK,
          recipient: recipientPK,
          keyBasePath: pathToZkProof,
          storage: localStorage
        });
      } else {
        await withdrawSPL({
          lightWasm,
          base_units: withdrawAmountWei,
          connection,
          encryptionService,
          publicKey: srcWalletPK,
          recipient: recipientPK,
          keyBasePath: pathToZkProof,
          storage: localStorage,
          mintAddress: tokenAddr
        });
      }
      console.debug('[RUBIC] ✅ Successfull withdrawal!');
    } catch (err) {
      console.debug('[RUBIC] ❌ Failed withdrawal!');
      throw err;
    }
  }

  public async makeFullWithdraw(
    tokenAddr: string,
    srcWalletPK: PublicKey,
    recipientPK: PublicKey
  ): Promise<void> {
    await this.checkRequirements();

    const fullPrivateBalanceWei = await this.getPrivacyCashBalance(tokenAddr, srcWalletPK);

    return this.makePartialWithdraw(tokenAddr, fullPrivateBalanceWei, srcWalletPK, recipientPK);
  }

  public async makeSwapAndWithdraw(
    srcToken: BalanceToken,
    dstToken: BalanceToken,
    receiverAddr: string,
    signature: Uint8Array
  ): Promise<void> {
    await this.checkRequirements();

    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;

    const walletAddr = this.walletConnectorService.address;
    const userWalletPK = new PublicKey(walletAddr);
    const receiverPK = new PublicKey(receiverAddr);

    const burnerKeypair = await this.deriveSolanaKeypairFromEncryptionKeyBase58(
      signature,
      userWalletPK,
      0
    );
    console.debug(`[RUBIC] burnerKeypair generated ==>`, {
      publicKey: burnerKeypair.publicKey.toBase58(),
      secretKey: burnerKeypair.secretKey.toString(),
      secretBuffer: JSON.stringify(burnerKeypair.secretKey.buffer)
    });
    localStorage.setItem('PRIVACYCASH_PRIVATE_KEY', burnerKeypair.secretKey.toString());
    localStorage.setItem('PRIVACYCASH_PUBLIC_KEY', burnerKeypair.publicKey.toBase58());

    const srcTokenBurnerBalanceBeforeWithdraw = await this.getBurnerBalance(
      srcToken.address,
      burnerKeypair,
      connection
    );
    console.debug(
      '[RUBIC] srcTokenBurnerBalanceBeforeWithdraw before withdraw ==>',
      srcTokenBurnerBalanceBeforeWithdraw
    );

    // withdraw src coin to burner wallet
    await this.makeFullWithdraw(srcToken.address, userWalletPK, burnerKeypair.publicKey);
    console.debug('[RUBIC] after withdraw ==>', {
      from: userWalletPK.toBase58(),
      to: burnerKeypair.publicKey.toBase58()
    });

    const srcTokenBurnerBalance = await this.waitForUpdatedBurnerWalletBalance(
      toRubicTokenAddr(srcToken.address),
      srcTokenBurnerBalanceBeforeWithdraw,
      burnerKeypair,
      connection
    );
    console.debug(`[RUBIC] srcTokenBurnerBalance after withdraw ==>`, srcTokenBurnerBalance);

    const dstTokenBurnerBalance = await this.getBurnerBalance(
      dstToken.address,
      burnerKeypair,
      connection
    );
    console.debug(
      `[RUBIC] dstTokenBurnerBalance ${dstTokenBurnerBalance} ==>`,
      dstTokenBurnerBalance
    );

    const swapAmount = this.getAmountWithoutFees(srcToken.address, srcTokenBurnerBalance);
    console.debug('[RUBIC] swapAmount ==>', swapAmount);

    console.debug('[RUBIC] before jupSwap ==>', {
      fromToken: srcToken.address,
      toToken: dstToken.address,
      srcWallet: burnerKeypair.publicKey.toBase58(),
      recepientWallet: burnerKeypair.publicKey.toBase58()
    });
    this.notificationsService.showInfo(`Swapping tokens...`);
    // swap on burner wallet srcToken -> dstToken
    const swapResp = await this.jupiterSwapService.jupSwap(
      new PublicKey(srcToken.address),
      new PublicKey(dstToken.address),
      swapAmount.toNumber(),
      burnerKeypair
    );
    console.debug('[RUBIC] after jupSwap ==>', swapResp);

    this.notificationsService.showInfo(`Waiting for network state updating...`);
    const newDstTokenBurnerBalance = await this.waitForUpdatedBurnerWalletBalance(
      toRubicTokenAddr(dstToken.address),
      dstTokenBurnerBalance,
      burnerKeypair,
      connection
    );
    console.debug('[RUBIC] newDstTokenBurnerBalance ==>', newDstTokenBurnerBalance);

    const dstTokenDepositAmount = this.getAmountWithoutFees(
      dstToken.address,
      newDstTokenBurnerBalance
    );
    console.debug('[RUBIC] dstTokenDepositAmount ==>', dstTokenDepositAmount);

    // deposit destination token from burner wallet
    this.notificationsService.showInfo(`Depositing target tokens to private wallet...`);
    await this.makeDeposit(
      dstToken.address,
      dstTokenDepositAmount.toNumber(),
      burnerKeypair.publicKey,
      (tx: VersionedTransaction) => {
        tx.sign([burnerKeypair]);
        return Promise.resolve(tx);
      }
    );
    console.debug('[RUBIC] after deposit from ==>', burnerKeypair.publicKey.toBase58());

    // withdraw from burner to target receiver address
    this.notificationsService.showInfo(`Final withdrawal to receiver wallet...`);
    await this.makeFullWithdraw(dstToken.address, burnerKeypair.publicKey, receiverPK);
    console.debug('[RUBIC] after final makeFullWithdraw ==>');
  }

  /**
   * @returns wei balance on PrivacyCash relayer
   */
  public async getPrivacyCashBalance(tokenAddr: string, walletPK: PublicKey): Promise<number> {
    try {
      await this.checkRequirements();

      const encryptionService = this.encryptionService;
      const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        BLOCKCHAIN_NAME.SOLANA
      ).public;

      if (tokenAddr === WRAP_SOL_ADDRESS) {
        const utxos = await getUtxos({
          publicKey: walletPK,
          connection,
          encryptionService,
          storage: localStorage
        });
        const res = getBalanceFromUtxos(utxos);
        console.debug('✅ Successfull getBalance!');

        return res.lamports;
      }

      const utxos = await getUtxosSPL({
        publicKey: walletPK,
        connection,
        encryptionService,
        storage: localStorage,
        mintAddress: tokenAddr
      });
      const res = getBalanceFromUtxosSPL(utxos);
      console.debug('✅ Successfull getBalance!');

      return res.base_units;
    } catch (err) {
      console.debug('❌ Failed getBalance!');
      throw err;
    }
  }

  public async makeSignature(): Promise<Uint8Array> {
    const wallet = this.walletConnectorService.provider?.wallet;
    const userAddr = this.walletConnectorService.address;

    if (!userAddr || !wallet) {
      this.notificationsService.showWarning('Connect wallet to sign.');
      throw new WalletNotConnectedError();
    }
    const encodedMessage = new TextEncoder().encode(`Privacy Money account sign in`);

    try {
      const resp = await wallet.signMessage(encodedMessage, 'utf8');

      this._signature$.next(resp.signature);
      this.encryptionService.deriveEncryptionKeyFromSignature(resp.signature);

      return resp.signature;
    } catch (err) {
      throw new Error('Failed to sign message: ' + err.message);
    }
  }

  private async deriveSolanaKeypairFromEncryptionKeyBase58(
    ikm: Uint8Array,
    publicKey: PublicKey,
    index: number
  ): Promise<Keypair> {
    let saltContext = 'privacycash:v1:' + publicKey.toBase58();

    if (index < 0 || !Number.isInteger(index))
      throw new Error('index must be a non-negative integer');
    if (ikm.length < 32) {
      throw new Error(`Decoded encryptionKey is only ${ikm.length} bytes (<32).`);
    }

    const msgBuffer = new TextEncoder().encode(saltContext);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const salt = new Uint8Array(hashBuffer);
    const info = new TextEncoder().encode(`privacycash:solana:wallet:v1:${index}`);

    const seed = await this.hkdf(ikm, salt, info, 32);

    return Keypair.fromSeed(new Uint8Array(seed));
  }

  private getAmountWithoutFees(
    tokenAddr: string,
    tokenBurnerWalletBalanceWei: BigNumber
  ): BigNumber {
    if (tokenAddr === WRAP_SOL_ADDRESS) {
      const swapAmount = tokenBurnerWalletBalanceWei.minus(
        new BigNumber(swap_reserved_rent_fee + 0.002).multipliedBy(1e9)
      );
      return swapAmount;
    }

    return tokenBurnerWalletBalanceWei;
  }

  /**
   * @TODO restrict retries
   */
  private async waitForUpdatedBurnerWalletBalance(
    tokenAddr: string,
    prevBurnerBalance: BigNumber,
    burnerKeypair: Keypair,
    connection: Connection,
    retryCount: number = 0
  ): Promise<BigNumber> {
    let newBurnerBalance = prevBurnerBalance;
    while (retryCount < 10) {
      await waitFor(5_000);
      newBurnerBalance = await this.getBurnerBalance(tokenAddr, burnerKeypair, connection);
      console.debug('[RUBIC] WAIT FOR BALANCE UPDATED', {
        tokenAddr,
        prevBurnerBalance,
        newBurnerBalance
      });
      // @TODO эта проверка не срабатывает даже если новый баланс стал больше старого
      if (newBurnerBalance.gt(prevBurnerBalance)) return newBurnerBalance;
      retryCount++;
    }
    return newBurnerBalance;
  }

  private async getBurnerBalance(
    tokenAddr: string,
    burnerKeypair: Keypair,
    _connection: Connection
  ): Promise<BigNumber> {
    const solanaAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    );
    return solanaAdapter.getBalance(burnerKeypair.publicKey.toBase58(), tokenAddr);
  }

  private async hkdf(
    ikm: Uint8Array,
    salt: Uint8Array,
    info: Uint8Array,
    length: number
  ): Promise<Uint8Array> {
    const saltArrayBuffer = new Uint8Array(salt).buffer;
    const ikmArrayBuffer = new Uint8Array(ikm).buffer;
    const infoArrayBuffer = new Uint8Array(info).buffer;

    const baseKey = await crypto.subtle.importKey('raw', ikmArrayBuffer, { name: 'HKDF' }, false, [
      'deriveBits'
    ]);

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: saltArrayBuffer,
        info: infoArrayBuffer
      },
      baseKey,
      length * 8
    );

    return new Uint8Array(derivedBits);
  }

  public async checkRequirements(): Promise<void> {
    const wallet = this.walletConnectorService.provider.wallet;
    const userAddr = this.walletConnectorService.address;
    const connectedChain = this.walletConnectorService.network;

    if (!wallet || !userAddr) {
      throw new Error('wallet not connected');
    }
    if (connectedChain !== BLOCKCHAIN_NAME.SOLANA) {
      throw new Error('SOLANA network not connected');
    }

    if (!this.signature) await this.makeSignature();
  }
}
