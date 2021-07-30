import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BehaviorSubject, Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';

@Component({
  selector: 'app-tokens-select',
  templateUrl: './tokens-select.component.html',
  styleUrls: ['./tokens-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSelectComponent implements OnInit {
  public tokens: Observable<AvailableTokenAmount[]>;

  public customToken: AvailableTokenAmount;

  public tokensToShow$ = new BehaviorSubject<AvailableTokenAmount[]>([]);

  private _blockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private _query = '';

  private readonly formType: 'from' | 'to';

  private readonly form: FormGroup<ISwapFormInput>;

  get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  set blockchain(value: BLOCKCHAIN_NAME) {
    if (value) {
      this._blockchain = value;

      const tokenType = this.formType === 'from' ? 'fromToken' : 'toToken';
      if (!this.form.value[tokenType]) {
        const blockchainType = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
        this.form.patchValue({
          [blockchainType]: this._blockchain
        });
      }

      this.updateTokensList();
    }
  }

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
    this.updateTokensList();
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      AvailableTokenAmount,
      {
        tokens: Observable<AvailableTokenAmount[]>;
        formType: 'from' | 'to';
        currentBlockchain: BLOCKCHAIN_NAME;
        form: FormGroup<ISwapFormInput>;
      }
    >,
    private cdr: ChangeDetectorRef,
    private web3PublicService: Web3PublicService,
    private authService: AuthService
  ) {
    this.tokens = context.data.tokens;
    this.formType = context.data.formType;
    this.form = context.data.form;
    this.blockchain = context.data.currentBlockchain;
  }

  ngOnInit() {
    this.updateTokensList();
  }

  close() {
    this.context.completeWith(null);
  }

  onTokenSelect(token: AvailableTokenAmount) {
    this.context.completeWith(token);
  }

  private updateTokensList(): void {
    this.customToken = null;
    this.tokens.subscribe(tokens => {
      const currentBlockchainTokens = tokens.filter(token => token.blockchain === this.blockchain);
      const sortedAndFilteredTokens = this.filterAndSortTokens(currentBlockchainTokens);
      this.tokensToShow$.next(sortedAndFilteredTokens);

      if (!sortedAndFilteredTokens.length) {
        this.tryParseQueryAsCustomToken();
      }
    });
  }

  private filterAndSortTokens(tokens: AvailableTokenAmount[]): AvailableTokenAmount[] {
    const comparator = (a: AvailableTokenAmount, b: AvailableTokenAmount) => {
      const amountsDelta = b.amount
        .multipliedBy(b.price)
        .minus(a.amount.multipliedBy(a.price))
        .toNumber();
      return Number(b.available) - Number(a.available) || amountsDelta || b.rank - a.rank;
    };

    const query = this.query.toLowerCase();
    if (!query) {
      return tokens.sort(comparator);
    }

    if (query.startsWith('0x')) {
      return tokens.filter(token => token.address.toLowerCase().includes(query)).sort(comparator);
    }

    const sybmolMatchingTokens = tokens
      .filter(token => token.symbol.toLowerCase().includes(query))
      .sort(comparator);
    const nameMatchingTokens = tokens
      .filter(
        token =>
          token.name.toLowerCase().includes(query) &&
          sybmolMatchingTokens.every(item => item.address !== token.address)
      )
      .sort(comparator);

    return sybmolMatchingTokens.concat(nameMatchingTokens);
  }

  private async tryParseQueryAsCustomToken(): Promise<void> {
    if (this.query) {
      const web3Public: Web3Public = this.web3PublicService[this.blockchain];

      if (!web3Public.isAddressCorrect(this.query)) {
        return;
      }

      const blockchainToken: BlockchainToken = await web3Public
        .getTokenInfo(this.query)
        .catch(() => null);

      if (blockchainToken?.name && blockchainToken?.symbol && blockchainToken?.decimals != null) {
        const amount = this.authService.user?.address
          ? (await web3Public.getTokenBalance(this.authService.user.address, this.query)).div(
              10 ** blockchainToken.decimals
            )
          : new BigNumber(0);

        const oppositeTokenType = this.formType === 'from' ? 'toToken' : 'fromToken';
        const oppositeToken = this.form.value[oppositeTokenType];

        this.customToken = {
          ...blockchainToken,
          rank: 0,
          image: 'assets/images/icons/coins/default-token-ico.webp',
          amount,
          price: 0,
          usedInIframe: true,
          available: !oppositeToken || this.blockchain === oppositeToken.blockchain
        };

        this.cdr.detectChanges();
      }
    }
  }
}
