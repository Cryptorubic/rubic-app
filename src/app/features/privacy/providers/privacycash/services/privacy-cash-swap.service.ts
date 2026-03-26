import { Injectable, inject } from '@angular/core';
import { BLOCKCHAIN_NAME, Token, TokenAmount } from '@cryptorubic/core';
import {
  WRAP_SOL_ADDRESS,
  addr_to_symbol_map,
  deposit_rent_fee,
  swap_reserved_rent_fee
} from '../constants/privacycash-consts';
import { deposit, depositSPL, withdraw, withdrawSPL } from 'privacycash/utils';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { Web3Pure, waitFor } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { compareAddresses, compareTokens } from '@app/shared/utils/utils';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { BlockchainToken } from '@app/shared/models/tokens/blockchain-token';
import { PrivacycashApiService } from './privacy-cash-api.service';
import { PrivacycashSignatureService } from './privacy-cash-signature.service';
import { toPrivacyCashTokenAddr, toRubicTokenAddr } from '../utils/converter';
import { SolanaWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { PrivacycashTokensService } from './common/token-facades/privacycash-tokens.service';
import { EphemeralWalletTokensService } from './common/token-facades/ephemeral-wallet-tokens.service';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';

@Injectable()
export class PrivacycashSwapService {
  private readonly adapterFactory = inject(BlockchainAdapterFactoryService);

  private readonly privacycashApiService = inject(PrivacycashApiService);

  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly notificationsService = inject(NotificationsService);

  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly ephemeralWalletTokensService = inject(EphemeralWalletTokensService);

  private readonly privateLocalStorageService = inject(PrivateLocalStorageService);

  /**
   * @param srcToken token with PrivacyCash compatible address(WRAP_SOL_ADDRESS instead of native)
   * @param dstToken token with PrivacyCash compatible address(WRAP_SOL_ADDRESS instead of native)
   * @param srcAmountNonWei ex. 0.002
   * @returns dstToken TokenAmount where native address is So11111111111111111111111111111111111111111
   */
  public async quote(
    srcToken: TokenAmount,
    dstToken: Token,
    srcAmountNonWei: BigNumber
  ): Promise<TokenAmount> {
    const rubicSrcToken = { ...srcToken, address: toRubicTokenAddr(srcToken.address) };
    const rubicDstToken = { ...dstToken, address: toRubicTokenAddr(dstToken.address) };

    const isSrcNative = Web3Pure.isNativeAddress(rubicSrcToken.blockchain, rubicSrcToken.address);
    const isDstNative = Web3Pure.isNativeAddress(rubicDstToken.blockchain, rubicDstToken.address);
    const isDirectTransfer = compareTokens(srcToken, dstToken);
    const walletAddr = this.walletConnectorService.address;

    if (isDirectTransfer) {
      const directWithdrawFee = await this.estimateDirectWithdrawFee(
        srcToken.address,
        srcAmountNonWei
      );
      const dstAmount = srcAmountNonWei.minus(directWithdrawFee);
      return new TokenAmount({
        ...rubicSrcToken,
        tokenAmount: dstAmount.gt(0) ? dstAmount : new BigNumber(0)
      });
    }

    const directWithdrawFee = await this.estimateDirectWithdrawFee(
      srcToken.address,
      srcAmountNonWei
    );
    const srcAmountAfterFees = srcAmountNonWei
      .minus(directWithdrawFee)
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
    return new TokenAmount({
      ...rubicDstToken,
      tokenAmount: dstAmountNonWeiWithoutReservedRentFee
    });
  }

  // withdraw private-public
  public async transfer(token: TokenAmount, receiverAddr: string): Promise<void> {
    const senderPK = new PublicKey(this.walletConnectorService.address);
    const recipientPK = new PublicKey(receiverAddr);
    const feesResp = await this.privacycashApiService.fetchFees();
    const pcTokenSymbol = addr_to_symbol_map[token.address.toLowerCase()];
    const srcTokenUsdPricePerOne = feesResp.prices[pcTokenSymbol];
    const srcTokenMinWithdrawAmountUsd = feesResp.minimum_withdrawal[pcTokenSymbol];
    const srcTokenUsdAmount = token.tokenAmount.multipliedBy(srcTokenUsdPricePerOne);

    if (srcTokenUsdAmount.lt(srcTokenMinWithdrawAmountUsd)) {
      this.notificationsService.showWarning(
        `Minimum transfer is ${srcTokenMinWithdrawAmountUsd} ${pcTokenSymbol}.`
      );
      return;
    }

    await this.makePartialWithdraw(
      toPrivacyCashTokenAddr(token.address),
      token.weiAmount.toNumber(),
      senderPK,
      recipientPK
    );
    this.notificationsService.showInfo(`Transfer successful. Check the receiver’s wallet balance.`);
    this.privacycashTokensService.updatePrivateBalances();
  }

  public async shield(token: TokenAmount): Promise<void> {
    const userPK = new PublicKey(this.walletConnectorService.address);
    const wallet: SolanaWallet = this.walletConnectorService.provider.wallet;

    await this.makeDeposit(
      toPrivacyCashTokenAddr(token.address),
      token.weiAmount.toNumber(),
      userPK,
      (tx: VersionedTransaction) => wallet.signTransaction(tx)
    );
    this.notificationsService.showInfo(`Shielding successful. Check your private balance.`);
    this.privacycashTokensService.updatePrivateBalances();
    this.privateLocalStorageService.markProviderAsShielded(PRIVATE_TRADE_TYPE.PRIVACY_CASH);
  }

  public async unshield(token: TokenAmount, receiverAddr: string): Promise<void> {
    const senderPK = new PublicKey(this.walletConnectorService.address);
    const recipientPK = new PublicKey(receiverAddr);
    const feesResp = await this.privacycashApiService.fetchFees();
    const pcTokenSymbol = addr_to_symbol_map[token.address.toLowerCase()];
    const srcTokenUsdPricePerOne = feesResp.prices[pcTokenSymbol];
    const srcTokenMinWithdrawAmountUsd = feesResp.minimum_withdrawal[pcTokenSymbol];
    const srcTokenUsdAmount = token.tokenAmount.multipliedBy(srcTokenUsdPricePerOne);

    if (srcTokenUsdAmount.lt(srcTokenMinWithdrawAmountUsd)) {
      this.notificationsService.showWarning(
        `Minimum unshield is ${srcTokenMinWithdrawAmountUsd} ${pcTokenSymbol}.`
      );
      return;
    }

    await this.makePartialWithdraw(
      toPrivacyCashTokenAddr(token.address),
      token.weiAmount.toNumber(),
      senderPK,
      recipientPK
    );
    this.notificationsService.showInfo(
      'Unshielding successful. Check the receiver’s wallet balance.'
    );
    this.privacycashTokensService.updatePrivateBalances();
  }

  /**
   * @description Starts swap for user's specified amount
   * @param srcToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param dstToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param srcAmountWei
   * @param receiverAddr
   */
  public async swapPartialPrivateBalance(
    srcToken: BlockchainToken,
    dstToken: BlockchainToken,
    srcAmountWei: BigNumber
  ): Promise<void> {
    try {
      await this.privacycashSignatureService.checkRequirements();

      const srcAmountNonWei = Token.fromWei(srcAmountWei, srcToken.decimals);
      const feesResp = await this.privacycashApiService.fetchFees();
      const pcTokenSymbol = addr_to_symbol_map[srcToken.address.toLowerCase()];
      const srcTokenUsdPricePerOne = feesResp.prices[pcTokenSymbol];
      const srcTokenUsdAmount = srcAmountNonWei.multipliedBy(srcTokenUsdPricePerOne);

      if (srcTokenUsdAmount.lt(10)) {
        this.notificationsService.showWarning(`Minimum swap is $10.5.`);
        return;
      }

      const senderPK = new PublicKey(this.walletConnectorService.address);
      const ephemeralKeypair =
        await this.privacycashSignatureService.deriveSolanaKeypairFromEncryptionKeyBase58(
          this.privacycashSignatureService.signature,
          senderPK,
          0
        );
      console.debug(
        `[PrivacyCashSwapService_swapPartialPrivateBalance] burner wallet:`,
        ephemeralKeypair.publicKey.toBase58()
      );
      localStorage.setItem('PRIVACYCASH_PUBLIC_KEY', ephemeralKeypair.publicKey.toBase58());
      // @TODO_1712 удалить перед релизом
      localStorage.setItem('PRIVACYCASH_PRIVATE_KEY', ephemeralKeypair.secretKey.toString());

      const srcTokenBurnerBalanceBeforeWithdraw = await this.getBurnerBalance(
        toRubicTokenAddr(srcToken.address),
        ephemeralKeypair
      );

      // withdraw src coin from user private balance to burner wallet
      await this.makePartialWithdraw(
        srcToken.address,
        srcAmountWei.toNumber(),
        senderPK,
        ephemeralKeypair.publicKey
      );

      const srcTokenBurnerBalance = await this.waitForUpdatedBurnerWalletBalance(
        toRubicTokenAddr(srcToken.address),
        srcTokenBurnerBalanceBeforeWithdraw,
        ephemeralKeypair
      );
      const dstTokenPrevBurnerBalance = await this.getBurnerBalance(
        toRubicTokenAddr(dstToken.address),
        ephemeralKeypair
      );
      const swapAmountWei = this.getAmountWithoutFees(srcToken.address, srcTokenBurnerBalance);

      // swap on burner wallet srcToken -> dstToken
      this.notificationsService.showInfo(`Swapping tokens...`);
      const swapResp = await this.privacycashApiService.jupSwap(
        new PublicKey(srcToken.address),
        new PublicKey(dstToken.address),
        swapAmountWei.toNumber(),
        ephemeralKeypair
      );
      console.debug('[PrivacyCashSwapService_swapPartialPrivateBalance] jupSwap resp:', swapResp);

      this.notificationsService.showInfo(`Waiting for network state update...`);
      const newDstTokenBurnerBalance = await this.waitForUpdatedBurnerWalletBalance(
        toRubicTokenAddr(dstToken.address),
        dstTokenPrevBurnerBalance,
        ephemeralKeypair
      );
      const dstTokenDepositAmount = this.getAmountWithoutFees(
        dstToken.address,
        newDstTokenBurnerBalance
      );

      // deposit destination token from burner wallet
      this.notificationsService.showInfo(`Shielding target tokens...`);
      let retries = 0;
      while (retries < 5) {
        try {
          await this.makeDeposit(
            dstToken.address,
            dstTokenDepositAmount.toNumber(),
            ephemeralKeypair.publicKey,
            (tx: VersionedTransaction) => {
              tx.sign([ephemeralKeypair]);
              return Promise.resolve(tx);
            }
          );
          break;
        } catch (err) {
          retries++;
          console.debug(
            '[PrivacyCashSwapService_swapPartialPrivateBalance] retry Shielding target tokens'
          );
        }
      }

      this.notificationsService.showInfo('Swap successful.');
    } catch (err) {
      this.notificationsService.showInfo('Transaction failed. Please request a refund.');
      throw err;
    } finally {
      this.ephemeralWalletTokensService.updateBalances();
      this.privacycashTokensService.updatePrivateBalances();
    }
  }

  /**
   * @param srcTokenAddr PrivacyCash compatible address(WRAP_SOL_ADDRESS instead of native)
   * @returns non wei fee taken in src token by PrivacyCash for withdrawal
   */
  public async estimateDirectWithdrawFee(
    srcTokenAddr: string,
    srcAmountNonWei: BigNumber
  ): Promise<BigNumber> {
    const feesResp = await this.privacycashApiService.fetchFees();
    const receiversCount = 1;
    const fee_rate = feesResp.withdraw_fee_rate;
    const withdrawRateFee = srcAmountNonWei.multipliedBy(fee_rate);
    const withdrawRentFee = new BigNumber(
      feesResp.rent_fees[addr_to_symbol_map[srcTokenAddr.toLowerCase()]]
    ).multipliedBy(receiversCount);
    const withdrawFeeNonWei = withdrawRateFee.plus(withdrawRentFee);

    return withdrawFeeNonWei;
  }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   */
  private async makeDeposit(
    tokenAddr: string,
    depositAmountWei: number,
    depositorWalletPK: PublicKey,
    transactionSignerFn: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const lightWasm = this.privacycashSignatureService.lightWasm;
    const encryptionService = this.privacycashSignatureService.encryptionService;
    const connection = this.adapterFactory.getAdapter(BLOCKCHAIN_NAME.SOLANA).public;
    const pathToZkProof = 'assets/circuit2/transaction2';

    try {
      console.debug(`[RUBIC] Start deposit ${tokenAddr}...`);
      if (compareAddresses(tokenAddr, WRAP_SOL_ADDRESS)) {
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
  private async makePartialWithdraw(
    tokenAddr: string,
    withdrawAmountWei: number,
    senderPK: PublicKey,
    recipientPK: PublicKey
  ): Promise<void> {
    await this.privacycashSignatureService.checkRequirements();

    const connection = this.adapterFactory.getAdapter(BLOCKCHAIN_NAME.SOLANA).public;
    const encryptionService = this.privacycashSignatureService.encryptionService;
    const lightWasm = this.privacycashSignatureService.lightWasm;
    const pathToZkProof = 'assets/circuit2/transaction2';

    try {
      if (compareAddresses(tokenAddr, WRAP_SOL_ADDRESS)) {
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

  // private async makeFullWithdraw(
  //   tokenAddr: string,
  //   senderPK: PublicKey,
  //   recipientPK: PublicKey
  // ): Promise<void> {
  //   await this.privacycashSignatureService.checkRequirements();
  //   const fullPrivateBalanceWei = await this.privacycashTokensService.getPrivacyCashBalance(
  //     tokenAddr,
  //     senderPK,
  //     true
  //   );
  //   return this.makePartialWithdraw(tokenAddr, fullPrivateBalanceWei, senderPK, recipientPK);
  // }

  // /**
  //  * @description Starts swap for full amount stored on user's PrivacyCash balance
  //  * @param srcToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
  //  * @param dstToken PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
  //  * @param receiverAddr
  //  */
  // private async swapFullPrivateBalance(
  //   srcToken: BlockchainToken,
  //   dstToken: BlockchainToken
  // ): Promise<void> {
  //   await this.privacycashSignatureService.checkRequirements();

  //   const senderPK = new PublicKey(this.walletConnectorService.address);
  //   const fullPrivateBalanceWei = await this.privacycashTokensService.getPrivacyCashBalance(
  //     srcToken.address,
  //     senderPK,
  //     true
  //   );

  //   return this.swapPartialPrivateBalance(srcToken, dstToken, new BigNumber(fullPrivateBalanceWei));
  // }

  /**
   * @param tokenAddr PrivacyCash compatible (WRAP_SOL_ADDRESS instead of native)
   * @param tokenBurnerWalletBalanceWei wei balance of burner wallet
   */
  private getAmountWithoutFees(
    tokenAddr: string,
    tokenBurnerWalletBalanceWei: BigNumber
  ): BigNumber {
    if (compareAddresses(tokenAddr, WRAP_SOL_ADDRESS)) {
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
    ephemeralKeypair: Keypair
  ): Promise<BigNumber> {
    let newBurnerBalance = prevBurnerBalance;
    let retryCount = 0;
    while (retryCount < 10) {
      await waitFor(5_000);
      newBurnerBalance = await this.getBurnerBalance(tokenAddr, ephemeralKeypair);
      console.debug('[PrivacyCashSwapService_waitForUpdatedBurnerWalletBalance]', {
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
  private async getBurnerBalance(tokenAddr: string, ephemeralKeypair: Keypair): Promise<BigNumber> {
    const solanaAdapter = this.adapterFactory.getAdapter(BLOCKCHAIN_NAME.SOLANA);
    return solanaAdapter.getBalance(ephemeralKeypair.publicKey.toBase58(), tokenAddr);
  }
}
