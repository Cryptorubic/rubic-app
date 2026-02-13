import { ChangeDetectionStrategy, Component } from '@angular/core';
import { privacycash_tokens } from '../../constants/tokens';
import { WRAP_SOL_ADDRESS } from '../../constants/privacycash-consts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivacyCashSwapService } from '../../services/privacy-cash-swap.service';
import { BLOCKCHAIN_NAME, Token, nativeTokensList } from '@cryptorubic/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import BigNumber from 'bignumber.js';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { SolanaWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import {
  BehaviorSubject,
  combineLatestWith,
  debounceTime,
  filter,
  map,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { PrivacyCashRevertService } from '../../services/privacy-cash-revert.service';

interface TokenItem {
  id: string;
  name: string;
}

interface PrivacyCashFormValue {
  srcToken: string | null;
  dstToken: string | null;
  receiver: string;
  amount: number | null;
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

  public readonly amountCtrl = new FormControl<number>(null, [Validators.required]);

  public readonly privacyCashForm: FormGroup = new FormGroup({
    srcToken: this.srcTokenCtrl,
    dstToken: this.dstTokenCtrl,
    receiver: this.receiverCtrl,
    amount: this.amountCtrl
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
        ? this.privacyCashSwapService.getPrivacyCashBalance(srcTokenAddr, new PublicKey(userAddr))
        : of(0)
    ),
    tap(balanceWei => console.log('BALANCE_WEI ==>', balanceWei)),
    map(balanceWei => {
      const srcToken = this.tokensFacadeService.findTokenSync({
        address: this.toRubicTokenAddr(this.privacyCashFormValue.srcToken),
        blockchain: BLOCKCHAIN_NAME.SOLANA
      });
      return srcToken ? Token.fromWei(balanceWei, srcToken.decimals).toFixed() : '0';
    }),
    startWith('0')
  );

  public readonly signature$ = this.privacyCashSwapService.signature$;

  public get filteredDestinationTokens(): TokenItem[] {
    if (!this.srcTokenCtrl.value || this.srcTokenCtrl.value === WRAP_SOL_ADDRESS)
      return this.tokens;
    return this.tokens.filter(t => t.id === WRAP_SOL_ADDRESS || t.id === this.srcTokenCtrl.value);
  }

  readonly stringifyTokenId: TuiStringHandler<string> = (id: string) => {
    const token = this.tokens.find(t => t.id === id);
    return token ? token.name : id;
  };

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privacyCashSwapService: PrivacyCashSwapService,
    private readonly privacyCashRevertService: PrivacyCashRevertService,
    private readonly tokensFacadeService: TokensFacadeService,
    private readonly notificationsService: NotificationsService
  ) {}

  public makeSignature(): void {
    this.privacyCashSwapService.makeSignature();
  }

  public findTokenNameById(id: string): string {
    const token = (this.tokens || []).find(t => t.id === id);
    return token ? token.name : id;
  }

  public makeRefund(): void {
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const receiverAddr = this.privacyCashFormValue.receiver;
    const withdrawAmountNonWei = this.privacyCashFormValue.amount;
    // @TODO use real decimals
    const decimals = srcTokenAddr === WRAP_SOL_ADDRESS ? 9 : 6;
    this.privacyCashRevertService.refundTokens(
      srcTokenAddr,
      withdrawAmountNonWei,
      decimals,
      receiverAddr
    );
  }

  public async makeDeposit(): Promise<void> {
    console.debug('MAKE_DEPOSIT ==>', this.privacyCashFormValue);

    this.privacyCashSwapService.checkRequirements();
    if (!this.privacyCashFormValue.amount || !this.privacyCashFormValue.srcToken) {
      const msg = 'amount and token fields are empty';
      this.notificationsService.showWarning(msg);
      throw new Error(msg);
    }

    const depositTokenAddr = this.privacyCashFormValue.srcToken;
    const depositToken = this.tokensFacadeService.findTokenSync({
      address: this.toRubicTokenAddr(depositTokenAddr),
      blockchain: BLOCKCHAIN_NAME.SOLANA
    });
    const depositAmountWei = new BigNumber(
      Token.toWei(this.privacyCashFormValue.amount, depositToken.decimals)
    );
    const userAddr = this.walletConnectorService.address;

    const wallet: SolanaWallet = this.walletConnectorService.provider.wallet;

    await this.privacyCashSwapService.makeDeposit(
      depositTokenAddr,
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
    console.debug('MAKE_WITHDRAW ==>', this.privacyCashFormValue);

    this.privacyCashSwapService.checkRequirements();
    if (
      !this.privacyCashFormValue.receiver ||
      !this.privacyCashFormValue.srcToken ||
      !this.privacyCashFormValue.amount
    ) {
      const msg = 'receiver or token or amount fields are empty';
      this.notificationsService.showWarning(msg);
      throw new Error(msg);
    }

    const srcWalletAddr = this.walletConnectorService.address;
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const receiverAddr = this.privacyCashFormValue.receiver;
    const withdrawAmountNonWei = this.privacyCashFormValue.amount;
    const withdrawToken = this.tokensFacadeService.findTokenSync({
      address: this.toRubicTokenAddr(srcTokenAddr),
      blockchain: BLOCKCHAIN_NAME.SOLANA
    });
    const withdrawAmountWei = Token.toWei(withdrawAmountNonWei, withdrawToken.decimals);

    await this.privacyCashSwapService.makePartialWithdraw(
      srcTokenAddr,
      new BigNumber(withdrawAmountWei).toNumber(),
      new PublicKey(srcWalletAddr),
      new PublicKey(receiverAddr)
    );

    this.notificationsService.showInfo(`Successfull withdrawal to ${receiverAddr}.`);
    this._updatePrivateBalance$.next();
  }

  public async makeTransfer(): Promise<void> {
    console.debug('MAKE_TRANSFER ==>', this.privacyCashFormValue);

    this.privacyCashSwapService.checkRequirements();
    if (!this.privacyCashForm.valid) {
      const msg = 'Transfer required fields are empty';
      this.notificationsService.showWarning(msg);
      throw new Error(msg);
    }

    const receiverAddr = this.privacyCashFormValue.receiver;
    const amountNonWei = this.privacyCashFormValue.amount;
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const dstTokenAddr = this.privacyCashFormValue.dstToken;

    await this.privacyCashSwapService.makeSwapOrTransfer(
      new BigNumber(amountNonWei),
      srcTokenAddr,
      dstTokenAddr,
      receiverAddr
    );

    this.notificationsService.showInfo(
      `Successfull ${srcTokenAddr === dstTokenAddr ? 'transfer' : 'swap'}.`
    );
    this._updatePrivateBalance$.next();
  }

  private toRubicTokenAddr(tokenAddr: string): string {
    return tokenAddr === WRAP_SOL_ADDRESS ? nativeTokensList.SOLANA.address : tokenAddr;
  }
}
