import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { privacycash_tokens } from '../../constants/tokens';
import { NATIVE_SOL_ADDRESS } from '../../constants/privacycash-consts';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivacyCashSwapService } from '../../services/privacy-cash-swap.service';
import { BLOCKCHAIN_NAME, Token, nativeTokensList } from '@cryptorubic/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import BigNumber from 'bignumber.js';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { SolanaWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

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
  activeTabIndex = 0;

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

  public get filteredDestinationTokens(): TokenItem[] {
    if (!this.srcTokenCtrl.value || this.srcTokenCtrl.value === NATIVE_SOL_ADDRESS)
      return this.tokens;
    return this.tokens.filter(t => t.id === NATIVE_SOL_ADDRESS || t.id === this.srcTokenCtrl.value);
  }

  readonly stringifyTokenId: TuiStringHandler<string> = (id: string) => {
    const token = this.tokens.find(t => t.id === id);
    return token ? token.name : id;
  };

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privacyCashSwapService: PrivacyCashSwapService,
    private readonly tokensFacadeService: TokensFacadeService,
    private readonly notificationsService: NotificationsService
  ) {}

  public async makeDeposit(): Promise<void> {
    console.debug('MAKE_DEPOSIT ==>', this.privacyCashFormValue);

    this.privacyCashSwapService.checkRequirements();
    if (!this.privacyCashFormValue.amount || !this.privacyCashFormValue.srcToken) {
      throw new Error('amount and token fields are empty');
    }

    const depositTokenAddr = this.privacyCashFormValue.srcToken;
    const depositToken = this.tokensFacadeService.findTokenSync({
      address:
        depositTokenAddr === NATIVE_SOL_ADDRESS
          ? nativeTokensList.SOLANA.address
          : depositTokenAddr,
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
  }

  public async makeWithdraw(): Promise<void> {
    console.debug('MAKE_WITHDRAW ==>', this.privacyCashFormValue);

    this.privacyCashSwapService.checkRequirements();
    if (!this.privacyCashFormValue.receiver || !this.privacyCashFormValue.srcToken) {
      throw new Error('receiver and token fields are empty');
    }

    const srcWalletAddr = this.walletConnectorService.address;
    const srcTokenAddr = this.privacyCashFormValue.srcToken;
    const receiverAddr = this.privacyCashFormValue.receiver;
    const withdrawToken = this.tokensFacadeService.findTokenSync({
      address: srcTokenAddr === NATIVE_SOL_ADDRESS ? nativeTokensList.SOLANA.address : srcTokenAddr,
      blockchain: BLOCKCHAIN_NAME.SOLANA
    });

    await this.privacyCashSwapService.makeWithdraw(
      withdrawToken.address,
      withdrawToken.decimals,
      new PublicKey(srcWalletAddr),
      new PublicKey(receiverAddr)
    );
  }

  public async makeTransfer(): Promise<void> {
    console.debug('MAKE_TRANSFER ==>', this.privacyCashFormValue);

    this.privacyCashSwapService.checkRequirements();
    if (!this.privacyCashForm.valid) {
      throw new Error('Required fields are empty');
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
  }
}
