import { Injectable } from '@angular/core';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BLOCKCHAIN_NAME, PriceTokenAmount, Token } from '@cryptorubic/core';
import {
  WRAP_SOL_ADDRESS,
  addr_to_symbol_map,
  deposit_rent_fee,
  swap_reserved_rent_fee
} from '../constants/privacycash-consts';

import {
  deposit,
  depositSPL,
  withdraw,
  withdrawSPL,
  getUtxos,
  getBalanceFromUtxos,
  getUtxosSPL,
  getBalanceFromUtxosSPL
} from 'privacycash/utils';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { Web3Pure, waitFor } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { compareAddresses, compareTokens } from '@app/shared/utils/utils';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { toRubicTokenAddr } from '../utils/converter';
import { BlockchainToken } from '@app/shared/models/tokens/blockchain-token';
import { PrivacyCashApiService } from './privacy-cash-api.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivacyCashSignatureService } from './privacy-cash-signature.service';

@Injectable()
export class PrivacyCashSwapService {
  constructor(
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly privacycashApiService: PrivacyCashApiService,
    private readonly privacycashSignatureService: PrivacyCashSignatureService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly notificationsService: NotificationsService
  ) {}

  public getPrivacyCashBalance: (
    tokenAddr: string,
    walletPK: PublicKey,
    useCache: boolean
  ) => Promise<number> = this.getPrivacyCashBalanceFnFactory();

  /**
   * @param srcToken token with PrivacyCash compatible address(WRAP_SOL_ADDRESS instead of native)
   * @param dstToken token with PrivacyCash compatible address(WRAP_SOL_ADDRESS instead of native)
   * @param srcAmountNonWei ex. 0.002
   * @returns dstToken PriceTokenAmount where native address is So11111111111111111111111111111111111111111
   */
  public async makeQuote(
    srcToken: BalanceToken,
    dstToken: BalanceToken,
    srcAmountNonWei: BigNumber
  ): Promise<PriceTokenAmount> {
    const rubicSrcToken = { ...srcToken, address: toRubicTokenAddr(srcToken.address) };
    const rubicDstToken = { ...dstToken, address: toRubicTokenAddr(dstToken.address) };

    const isSrcNative = Web3Pure.isNativeAddress(rubicSrcToken.blockchain, rubicSrcToken.address);
    const isDstNative = Web3Pure.isNativeAddress(rubicDstToken.blockchain, rubicDstToken.address);
    const isDirectTransfer = compareTokens(srcToken, dstToken);
    const feesResp = await this.privacycashApiService.fetchFees();
    const walletAddr = this.walletConnectorService.address;

    const estimateDirectWithdrawFee = (): BigNumber => {
      const receiversCount = 1;
      const fee_rate = feesResp.withdraw_fee_rate;
      const withdrawRateFee = srcAmountNonWei.multipliedBy(fee_rate);
      const withdrawRentFee = new BigNumber(
        feesResp.rent_fees[addr_to_symbol_map[srcToken.address.toLowerCase()]]
      ).multipliedBy(receiversCount);
      const withdrawFeeNonWei = withdrawRateFee.plus(withdrawRentFee);

      return withdrawFeeNonWei;
    };

    if (isDirectTransfer) {
      const dstAmount = srcAmountNonWei.minus(estimateDirectWithdrawFee());
      return new PriceTokenAmount({
        ...rubicSrcToken,
        price: new BigNumber(rubicSrcToken.price || 0),
        tokenAmount: dstAmount.gt(0) ? dstAmount : new BigNumber(0)
      });
    }

    const srcAmountAfterFees = srcAmountNonWei
      .minus(estimateDirectWithdrawFee())
      .minus(isSrcNative ? swap_reserved_rent_fee : 0);
    const srcAmountAfterFeesWei = new BigNumber(
      Token.toWei(srcAmountAfterFees, srcToken.decimals)
    ).toNumber();
    const buildSwapResp = await this.privacycashApiService
      .buildSwapTx(srcAmountAfterFeesWei, srcToken.address, dstToken.address, walletAddr)
      .catch(() => ({ outAmount: '0' }));
    const dstAmountNonWei = Token.fromWei(buildSwapResp.outAmount, dstToken.decimals);
    const dstAmountNonWeiWithoutReservedRentFee = dstAmountNonWei.minus(
      isDstNative ? swap_reserved_rent_fee : 0
    );

    return new PriceTokenAmount({
      ...rubicDstToken,
      price: new BigNumber(rubicDstToken.price || 0),
      tokenAmount: dstAmountNonWeiWithoutReservedRentFee
    });
  }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   */
  public async makeDeposit(
    tokenAddr: string,
    depositAmountWei: number,
    depositorWalletPK: PublicKey,
    transactionSignerFn: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const lightWasm = this.privacycashSignatureService.lightWasm;
    const encryptionService = this.privacycashSignatureService.encryptionService;
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
      console.debug('[PrivacyCashSwapService_makeDeposit] ✅ Successfull deposit!');
    } catch (err) {
      console.debug('[PrivacyCashSwapService_makeDeposit] ❌ Failed deposit!');
      throw err;
    }
  }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   */
  public async makePartialWithdraw(
    tokenAddr: string,
    withdrawAmountWei: number,
    senderPK: PublicKey,
    recipientPK: PublicKey
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const connection = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    ).public;
    const encryptionService = this.privacycashSignatureService.encryptionService;
    const lightWasm = this.privacycashSignatureService.lightWasm;
    const pathToZkProof = 'assets/circuit2/transaction2';

    try {
      if (tokenAddr === WRAP_SOL_ADDRESS) {
        await withdraw({
          lightWasm,
          amount_in_lamports: withdrawAmountWei,
          connection,
          encryptionService,
          publicKey: senderPK,
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
          publicKey: senderPK,
          recipient: recipientPK,
          keyBasePath: pathToZkProof,
          storage: localStorage,
          mintAddress: tokenAddr
        });
      }
      console.debug('[PrivacyCashSwapService_makePartialWithdraw] ✅ Successfull withdrawal!');
    } catch (err) {
      console.debug('[PrivacyCashSwapService_makePartialWithdraw] ❌ Failed withdrawal!');
      throw err;
    }
  }

  public async makeFullWithdraw(
    tokenAddr: string,
    senderPK: PublicKey,
    recipientPK: PublicKey
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const fullPrivateBalanceWei = await this.getPrivacyCashBalance(tokenAddr, senderPK, true);

    return this.makePartialWithdraw(tokenAddr, fullPrivateBalanceWei, senderPK, recipientPK);
  }

  /**
   * @description Starts swap for full amount stored on user's PrivacyCash balance
   * @param srcToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param dstToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param receiverAddr
   */
  private async swapFullPrivateBalance(
    srcToken: BlockchainToken,
    dstToken: BlockchainToken
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const senderPK = new PublicKey(this.walletConnectorService.address);
    const fullPrivateBalanceWei = await this.getPrivacyCashBalance(
      srcToken.address,
      senderPK,
      true
    );

    return this.swapPartialPrivateBalance(srcToken, dstToken, new BigNumber(fullPrivateBalanceWei));
  }

  /**
   * @description Starts swap for user's specified amount
   * @param srcToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param dstToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param srcAmountWei
   */
  public async swapPartialPrivateBalance(
    srcToken: BlockchainToken,
    dstToken: BlockchainToken,
    srcAmountWei: BigNumber
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const srcAmountNonWei = Token.fromWei(srcAmountWei, srcToken.decimals);
    const feesResp = await this.privacycashApiService.fetchFees();
    const srcTokenUsdPricePerOne =
      feesResp.prices[addr_to_symbol_map[srcToken.address.toLowerCase()]];
    const srcTokenUsdAmount = srcTokenUsdPricePerOne * Number(srcAmountNonWei);

    if (!compareAddresses(srcToken.address, dstToken.address) && srcTokenUsdAmount < 10) {
      this.notificationsService.showWarning(`Amount should be more than 10$ for swap.`);
      return;
    }

    const senderPK = new PublicKey(this.walletConnectorService.address);

    const burnerKeypair =
      await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
        this.privacycashSignatureService.signature,
        senderPK,
        0
      );
    console.debug(
      `[PrivacyCashSwapService_swapPartialPrivateBalance] burner wallet:`,
      burnerKeypair.publicKey.toBase58()
    );

    const srcTokenBurnerBalanceBeforeWithdraw = await this.getBurnerBalance(
      toRubicTokenAddr(srcToken.address),
      burnerKeypair
    );

    // withdraw src coin from user private balance to burner wallet
    await this.makePartialWithdraw(
      srcToken.address,
      srcAmountWei.toNumber(),
      senderPK,
      burnerKeypair.publicKey
    );

    const srcTokenBurnerBalance = await this.waitForUpdatedBurnerWalletBalance(
      toRubicTokenAddr(srcToken.address),
      srcTokenBurnerBalanceBeforeWithdraw,
      burnerKeypair
    );
    const dstTokenPrevBurnerBalance = await this.getBurnerBalance(
      toRubicTokenAddr(dstToken.address),
      burnerKeypair
    );
    const swapAmountWei = this.getAmountWithoutFees(srcToken.address, srcTokenBurnerBalance);

    // swap on burner wallet srcToken -> dstToken
    this.notificationsService.showInfo(`Swapping tokens...`);
    const swapResp = await this.privacycashApiService.jupSwap(
      new PublicKey(srcToken.address),
      new PublicKey(dstToken.address),
      swapAmountWei.toNumber(),
      burnerKeypair
    );
    console.debug('[PrivacyCashSwapService_swapPartialPrivateBalance] jupSwap resp:', swapResp);

    this.notificationsService.showInfo(`Waiting for network state update...`);
    const newDstTokenBurnerBalance = await this.waitForUpdatedBurnerWalletBalance(
      toRubicTokenAddr(dstToken.address),
      dstTokenPrevBurnerBalance,
      burnerKeypair
    );
    const dstTokenDepositAmount = this.getAmountWithoutFees(
      dstToken.address,
      newDstTokenBurnerBalance
    );

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
    this.notificationsService.showInfo('Successfull deposit.');
  }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   */
  private getPrivacyCashBalanceFnFactory(): (
    tokenAddr: string,
    walletPK: PublicKey,
    useCache: boolean
  ) => Promise<number> {
    const cache = {} as Record<string, number>;
    const getCacheKey = (tokenAddr: string, walletPK: PublicKey): string => {
      return `${walletPK.toBase58()}::${tokenAddr}`;
    };
    return async (
      tokenAddr: string,
      walletPK: PublicKey,
      useCache: boolean = true
    ): Promise<number> => {
      const cacheKey = getCacheKey(tokenAddr, walletPK);
      const cachedValue = cache[cacheKey];
      if (useCache && cachedValue) {
        console.debug(
          '[PrivacyCashSwapService_getPrivacyCashBalanceFnFactory] found cached value',
          cachedValue
        );
        return cachedValue;
      }

      const privacyCashBalanceWei = await this.fetchPrivacyCashBalance(tokenAddr, walletPK);
      cache[cacheKey] = privacyCashBalanceWei;

      return privacyCashBalanceWei;
    };
  }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @returns wei balance on PrivacyCash relayer
   */
  private async fetchPrivacyCashBalance(tokenAddr: string, walletPK: PublicKey): Promise<number> {
    try {
      await this.privacycashSignatureService.checkRequirements();

      const encryptionService = this.privacycashSignatureService.encryptionService;
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

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param tokenBurnerWalletBalanceWei wei balance of burner wallet
   */
  private getAmountWithoutFees(
    tokenAddr: string,
    tokenBurnerWalletBalanceWei: BigNumber
  ): BigNumber {
    if (tokenAddr === WRAP_SOL_ADDRESS) {
      const swapAmount = tokenBurnerWalletBalanceWei.minus(
        new BigNumber(swap_reserved_rent_fee + deposit_rent_fee).multipliedBy(1e9)
      );
      return swapAmount;
    }

    return tokenBurnerWalletBalanceWei;
  }

  /**
   * @param tokenAddr common solana address
   */
  private async waitForUpdatedBurnerWalletBalance(
    tokenAddr: string,
    prevBurnerBalance: BigNumber,
    burnerKeypair: Keypair
  ): Promise<BigNumber> {
    let newBurnerBalance = prevBurnerBalance;
    let retryCount = 0;
    while (retryCount < 10) {
      await waitFor(5_000);
      newBurnerBalance = await this.getBurnerBalance(tokenAddr, burnerKeypair);
      console.debug('[RUBIC] WAIT FOR BALANCE UPDATED', {
        tokenAddr,
        prevBurnerBalance,
        newBurnerBalance
      });
      if (!newBurnerBalance.eq(prevBurnerBalance)) return newBurnerBalance;
      retryCount++;
    }
    return newBurnerBalance;
  }

  /**
   * @param tokenAddr common solana address
   */
  private async getBurnerBalance(tokenAddr: string, burnerKeypair: Keypair): Promise<BigNumber> {
    const solanaAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.SOLANA
    );
    return solanaAdapter.getBalance(burnerKeypair.publicKey.toBase58(), tokenAddr);
  }
}
