import { ChangeDetectionStrategy, Component } from '@angular/core';
import { privacycash_tokens } from '../../constants/tokens';
import { WRAP_SOL_ADDRESS } from '../../constants/privacycash-consts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivacyCashSwapService } from '../../services/privacy-cash-swap.service';
import { BLOCKCHAIN_NAME, PriceTokenAmount, Token } from '@cryptorubic/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import BigNumber from 'bignumber.js';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { SolanaWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import {
  BehaviorSubject,
  Observable,
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { PrivacyCashRevertService } from '../../services/privacy-cash-revert.service';
import { findPrivacyCashCompatibleToken, toRubicTokenAddr } from '../../utils/converter';
import { PrivacyCashSignatureService } from '../../services/privacy-cash-signature.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';

interface TokenItem {
  id: string;
  name: string;
}

interface PrivacyCashFormValue {
  srcToken: string | null;
  dstToken: string | null;
  receiver: string;
  amount: number | null;
  dstAmount: number | null;
}

@Component({
  selector: 'app-private-swaps-view',
  templateUrl: './private-swaps-view.component.html',
  styleUrls: ['./private-swaps-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateSwapsViewComponent {
  public activeTabIndex = 0;

  readonly tokens: TokenItem[] = privacycash_tokens;

  public readonly srcTokenCtrl = new FormControl<string | null>(null, [Validators.required]);

  public readonly dstTokenCtrl = new FormControl<string | null>(null, [Validators.required]);

  public readonly receiverCtrl = new FormControl<string>('', [Validators.required]);

  public readonly srcAmountCtrl = new FormControl<number | null>(null, [Validators.required]);

  public readonly dstAmountCtrl = new FormControl<number | null>({ value: null, disabled: true });

  public readonly privacyCashForm: FormGroup = new FormGroup({
    srcToken: this.srcTokenCtrl,
    dstToken: this.dstTokenCtrl,
    receiver: this.receiverCtrl,
    amount: this.srcAmountCtrl,
    dstAmount: this.dstAmountCtrl
  });

  public get privacyCashFormValue(): PrivacyCashFormValue {
    return this.privacyCashForm.value;
  }

  public get userWalletAddr(): string {
    return this.walletConnectorService.address ?? '';
  }

  private readonly _updatePrivateBalance$ = new BehaviorSubject<void>(undefined);

  public readonly privateBalanceNonWei$ = this._updatePrivateBalance$.pipe(
    combineLatestWith(this.srcTokenCtrl.valueChanges, this.walletConnectorService.addressChange$),
    filter(([_, srcTokenAddr]: [void, string, string]) => srcTokenAddr !== null),
    debounceTime(1_000),
    switchMap(([_, srcTokenAddr, userAddr]: [void, string, string]) =>
      userAddr
        ? this.privacyCashSwapService.getPrivacyCashBalance(
            srcTokenAddr,
            new PublicKey(userAddr),
            false
          )
        : of(0)
    ),
    map(balanceWei => {
      const srcToken = this.tokensFacadeService.findTokenSync({
        address: toRubicTokenAddr(this.privacyCashFormValue.srcToken),
        blockchain: BLOCKCHAIN_NAME.SOLANA
      });
      return srcToken ? Token.fromWei(balanceWei, srcToken.decimals).toFixed() : '0';
    }),
    startWith('0')
  );

  public readonly dstAmount$: Observable<PriceTokenAmount> = this.privacyCashForm.valueChanges.pipe(
    distinctUntilChanged(
      (prev: PrivacyCashFormValue, curr: PrivacyCashFormValue) =>
        prev.amount === curr.amount &&
        (this.activeTabIndex !== 2 || prev.dstToken === curr.dstToken) &&
        prev.srcToken === curr.srcToken
    ),
    filter(
      (value: PrivacyCashFormValue) =>
        value.amount !== null && !!value.srcToken && (this.activeTabIndex !== 2 || !!value.dstToken)
    ),
    debounceTime(300),
    switchMap(formValue =>
      this.privacyCashSwapService.makeQuote(
        findPrivacyCashCompatibleToken(this.tokensFacadeService, formValue.srcToken),
        findPrivacyCashCompatibleToken(
          this.tokensFacadeService,
          formValue.dstToken || formValue.srcToken
        ),
        new BigNumber(formValue.amount || 0)
      )
    ),
    tap(dstTokenFull => {
      this.dstAmountCtrl.setValue(dstTokenFull.tokenAmount.toNumber());
    })
  );

  public readonly signature$ = this.privacyCashSignatureService.signature$;

  readonly stringifyTokenId: TuiStringHandler<string> = (id: string) => {
    const token = this.tokens.find(t => t.id === id);
    return token ? token.name : id;
  };

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privacyCashSwapService: PrivacyCashSwapService,
    private readonly privacyCashRevertService: PrivacyCashRevertService,
    private readonly privacyCashSignatureService: PrivacyCashSignatureService,
    private readonly tokensFacadeService: TokensFacadeService,
    private readonly notificationsService: NotificationsService,
    private readonly sdkLegacyService: SdkLegacyService
  ) {}

  public makeSignature(): void {
    this.privacyCashSignatureService.makeSignature();
  }

  public findTokenNameById(id: string): string {
    const token = (this.tokens || []).find(t => t.id === id);
    return token ? token.name : id;
  }

  public async makeRefund(): Promise<void> {
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const receiverAddr = this.privacyCashFormValue.receiver;

    await this.privacyCashRevertService.refundTokens(toRubicTokenAddr(srcTokenAddr), receiverAddr);
  }

  public async makeDeposit(): Promise<void> {
    if (!this.privacyCashFormValue.amount || !this.privacyCashFormValue.srcToken) {
      this.notificationsService.showWarning('amount and token fields are empty');
      return;
    }

    const depositTokenAddr = this.privacyCashFormValue.srcToken;
    const depositToken = findPrivacyCashCompatibleToken(this.tokensFacadeService, depositTokenAddr);
    const depositAmountWei = new BigNumber(
      Token.toWei(this.privacyCashFormValue.amount, depositToken.decimals)
    );
    const userAddr = this.walletConnectorService.address;
    const wallet: SolanaWallet = this.walletConnectorService.provider.wallet;

    await this.privacyCashSwapService.makeDeposit(
      depositToken.address,
      depositAmountWei.toNumber(),
      new PublicKey(userAddr),
      async (tx: VersionedTransaction) => {
        return await wallet.signTransaction(tx);
      }
    );

    this.notificationsService.showInfo('Successfull deposit to private wallet.');
    this._updatePrivateBalance$.next();
  }

  public async makeWithdraw(): Promise<void> {
    if (
      !this.privacyCashFormValue.receiver ||
      !this.privacyCashFormValue.srcToken ||
      !this.privacyCashFormValue.amount
    ) {
      this.notificationsService.showWarning('receiver or token or amount fields are empty');
      return;
    }

    const srcWalletAddr = this.walletConnectorService.address;
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const receiverAddr = this.privacyCashFormValue.receiver;
    const withdrawAmountNonWei = this.privacyCashFormValue.amount;
    const withdrawToken = findPrivacyCashCompatibleToken(this.tokensFacadeService, srcTokenAddr);
    const withdrawAmountWei = Token.toWei(withdrawAmountNonWei, withdrawToken.decimals);

    await this.privacyCashSwapService.makePartialWithdraw(
      withdrawToken.address,
      new BigNumber(withdrawAmountWei).toNumber(),
      new PublicKey(srcWalletAddr),
      new PublicKey(receiverAddr)
    );

    this.notificationsService.showInfo(`Successfull withdrawal to ${receiverAddr}.`);
    this._updatePrivateBalance$.next();
  }

  public async makeSwap(): Promise<void> {
    if (
      !this.privacyCashFormValue.amount ||
      !this.privacyCashFormValue.srcToken ||
      !this.privacyCashFormValue.dstToken
    ) {
      this.notificationsService.showWarning('Swap required fields are empty');
      return;
    }
    if (this.privacyCashFormValue.srcToken === this.privacyCashFormValue.dstToken) {
      this.notificationsService.showWarning('Source and destination token must be different.');
      return;
    }
    if (
      this.privacyCashFormValue.srcToken !== WRAP_SOL_ADDRESS &&
      this.privacyCashFormValue.dstToken !== WRAP_SOL_ADDRESS
    ) {
      this.notificationsService.showWarning('Currently only SOL<->Mint routes are supported.');
      return;
    }

    const amountNonWei = this.privacyCashFormValue.amount;
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const dstTokenAddr = this.privacyCashFormValue.dstToken;
    const senderPK = new PublicKey(this.walletConnectorService.address);
    const srcToken = findPrivacyCashCompatibleToken(this.tokensFacadeService, srcTokenAddr);
    const dstToken = findPrivacyCashCompatibleToken(this.tokensFacadeService, dstTokenAddr);
    const amountWei = Token.toWei(amountNonWei, srcToken.decimals);

    const privacyCashBalanceWei = await this.privacyCashSwapService.getPrivacyCashBalance(
      srcTokenAddr,
      senderPK,
      true
    );
    const privacyCashBalanceNonWei = Token.fromWei(
      privacyCashBalanceWei,
      srcToken.decimals
    ).toNumber();

    if (new BigNumber(amountWei).gt(privacyCashBalanceWei)) {
      const userAddr = this.walletConnectorService.address;
      const wallet: SolanaWallet = this.walletConnectorService.provider.wallet;
      const depositAmountWei = new BigNumber(amountWei).minus(privacyCashBalanceWei);
      const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        BLOCKCHAIN_NAME.SOLANA
      );
      const balanceWei = await adapter.getBalance(userAddr, toRubicTokenAddr(srcTokenAddr));
      if (balanceWei.lt(depositAmountWei)) {
        const msg = `You don't have ${amountNonWei} ${srcToken.symbol} on private balance. Your private balance is ${privacyCashBalanceNonWei}.`;
        this.notificationsService.showWarning(msg);
        return;
      }

      const msg = `You don't have ${amountNonWei} ${srcToken.symbol} on private balance. Your private balance is ${privacyCashBalanceNonWei}. Starting deposit...`;
      this.notificationsService.showWarning(msg);

      await this.privacyCashSwapService.makeDeposit(
        srcToken.address,
        depositAmountWei.toNumber(),
        new PublicKey(userAddr),
        async (tx: VersionedTransaction) => {
          return await wallet.signTransaction(tx);
        }
      );
    }

    await this.privacyCashSwapService.swapPartialPrivateBalance(
      srcToken,
      dstToken,
      new BigNumber(amountWei)
    );

    this.notificationsService.showInfo('Successfull swap');
    this._updatePrivateBalance$.next();
  }
}
