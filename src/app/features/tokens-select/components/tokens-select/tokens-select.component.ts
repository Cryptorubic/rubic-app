import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Self,
  ViewChild
} from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, mapTo, takeUntil } from 'rxjs/operators';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { transitTokensWithMode } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensListComponent } from 'src/app/features/tokens-select/components/tokens-list/tokens-list.component';
import {
  CountPage,
  PAGINATED_BLOCKCHAIN_NAME,
  TokensNetworkState
} from 'src/app/shared/models/tokens/paginated-tokens';
import { StoreService } from 'src/app/core/services/store/store.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';

type ComponentInput = {
  tokens: BehaviorSubject<AvailableTokenAmount[]>;
  formType: 'from' | 'to';
  currentBlockchain: BLOCKCHAIN_NAME;
  form: FormGroup<ISwapFormInput>;
  allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;
  idPrefix: string;
};

type ComponentContext = TuiDialogContext<AvailableTokenAmount, ComponentInput>;

@Component({
  selector: 'app-tokens-select',
  templateUrl: './tokens-select.component.html',
  styleUrls: ['./tokens-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensSelectComponent implements OnInit {
  public listType: 'default' | 'favorite' = 'default';

  public tokens: BehaviorSubject<AvailableTokenAmount[]>;

  public customToken: AvailableTokenAmount;

  public tokensToShow$ = new BehaviorSubject([]);

  public allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  public loading = false;

  public idPrefix: string;

  public prevSelectedToken: TokenAmount;

  private _blockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private _query = '';

  private formType: 'from' | 'to';

  private form: FormGroup<ISwapFormInput>;

  public tokensNetworkState: CountPage;

  @ViewChild(TokensListComponent) tokensList: TokensListComponent;

  private readonly querySubject: BehaviorSubject<string>;

  public tokensListLoading: boolean;

  get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  public favoriteTokensToShow$: BehaviorSubject<AvailableTokenAmount[]>;

  private blockchainSubject = new BehaviorSubject<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM);

  set blockchain(value: BLOCKCHAIN_NAME) {
    if (value && value !== this.blockchain) {
      this.setNewBlockchain(value);
      if (this.tokensList?.scrollSubject?.value) {
        this.tokensList.scrollSubject.value.scrollToIndex(0, 'smooth');
      }
    }
  }

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
    this.querySubject.next(value);
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: ComponentContext,
    private readonly cdr: ChangeDetectorRef,
    private readonly blockchainPublicService: BlockchainPublicService,
    private readonly authService: AuthService,
    private readonly httpClient: HttpClient,
    private readonly tokensService: TokensService,
    private readonly store: StoreService,
    @Inject(TuiDestroyService) @Self() private readonly destroy$: TuiDestroyService,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.initiateContextParams(context.data);
    this.favoriteTokensToShow$ = new BehaviorSubject<AvailableTokenAmount[]>(null);
    this.tokensListLoading = false;
    this.querySubject = new BehaviorSubject<string>('');
  }

  /**
   * Defines if token pair is able to trade through cross-chain.
   * @param fromBlockchain From token blockchain.
   * @param toBlockchain To token blockchain.
   * @return boolean If token allowed in cross-chain returns true, otherwise false.
   */
  static allowInCrossChain(
    fromBlockchain: BLOCKCHAIN_NAME,
    toBlockchain: BLOCKCHAIN_NAME
  ): boolean {
    const availableNetworks = Object.keys(transitTokensWithMode.mainnet);
    return availableNetworks.includes(fromBlockchain) && availableNetworks.includes(toBlockchain);
  }

  /**
   * Switch tokens display mode (default and favorite).
   */
  public switchMode(): void {
    if (this.listType === 'default') {
      this.listType = 'favorite';
    } else {
      this.listType = 'default';
    }
  }

  /**
   * Set component input parameters.
   * @param context Component context.
   */
  private initiateContextParams(context: ComponentInput): void {
    this.tokens = context.tokens;
    this.formType = context.formType;
    this.form = context.form;
    this.allowedBlockchains = context.allowedBlockchains;
    this.idPrefix = context.idPrefix;
    this.blockchain = context.currentBlockchain;
    this.prevSelectedToken = this.form.value[this.formType === 'from' ? 'fromToken' : 'toToken'];
  }

  /**
   * Lifecycle hook.
   */
  public ngOnInit(): void {
    this.updateTokensList();
    this.querySubject
      .pipe(takeUntil(this.destroy$), debounceTime(500))
      .subscribe(() => this.updateTokensList());
  }

  /**
   * Set new blockchain.
   * @param chain Blockchain.
   */
  private setNewBlockchain(chain: BLOCKCHAIN_NAME): void {
    this._blockchain = chain;
    this.blockchainSubject.next(chain);

    const tokenType = this.formType === 'from' ? 'fromToken' : 'toToken';
    if (!this.form.value[tokenType]) {
      const blockchainType = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
      this.form.patchValue({
        [blockchainType]: this._blockchain
      });
    }

    this.updateTokensList();
  }

  /**
   * Handle modal close event.
   */
  public close(): void {
    this.context.completeWith(null);
  }

  /**
   * Handle token selection event.
   * @param selectedToken Selected token.
   */
  public tokenSelect(selectedToken: AvailableTokenAmount): void {
    this.context.completeWith(selectedToken);
  }

  /**
   * Update token list.
   */
  private updateTokensList(): void {
    this.customToken = null;
    const preventRepeat = distinctUntilChanged((prev: [], next: []) => prev.length === next.length);
    combineLatest([
      this.tokens.pipe(preventRepeat),
      this.tokensService.favoriteTokens$.pipe(preventRepeat)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(async ([tokens, favoriteTokens]) => {
        const filterByBlockchain = (token: AvailableTokenAmount) =>
          token.blockchain === this.blockchain;

        const currentBlockchainTokens = tokens.filter(filterByBlockchain);
        const sortedAndFilteredTokens = this.filterAndSortTokens(currentBlockchainTokens);
        const tokensWithFavorite = sortedAndFilteredTokens.map(token => ({
          ...token,
          favorite: favoriteTokens.some(favoriteToken =>
            TokensService.areTokensEqual(favoriteToken, token)
          )
        }));
        const availableFavoriteTokens = tokensWithFavorite.filter(el => el.favorite);

        this.tokensToShow$.next(tokensWithFavorite);
        this.favoriteTokensToShow$?.next(availableFavoriteTokens);

        const shouldSearch =
          (this.listType === 'default' && !sortedAndFilteredTokens.length) ||
          (this.listType === 'favorite' && !availableFavoriteTokens.length);

        if (shouldSearch) {
          this.loading = true;
          this.cdr.detectChanges();
          await this.tryParseQuery();
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    this.tokensService.tokensNetworkState
      .pipe(takeUntil(this.destroy$))
      .subscribe((el: TokensNetworkState) => {
        this.tokensNetworkState = el[this.blockchain as PAGINATED_BLOCKCHAIN_NAME];
      });
  }

  /**
   * Filter and sort tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return AvailableTokenAmount[] Filtered and sorted tokens.
   */
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

  /**
   * If query exists, parse custom token from Web3.
   */
  private async tryParseQueryAsCustomToken(): Promise<void> {
    if (this.query) {
      const blockchainPublicAdapter = this.blockchainPublicService.adapters[this.blockchain];

      if (!blockchainPublicAdapter.isAddressCorrect(this.query)) {
        return;
      }

      const blockchainToken = await blockchainPublicAdapter
        .getTokenInfo(this.query)
        .catch(() => null);

      if (blockchainToken?.name && blockchainToken?.symbol && blockchainToken?.decimals != null) {
        const amount = this.authService.user?.address
          ? (
              await blockchainPublicAdapter.getTokenBalance(
                this.authService.user.address,
                this.query
              )
            ).div(10 ** blockchainToken.decimals)
          : new BigNumber(0);

        const oppositeTokenType = this.formType === 'from' ? 'toToken' : 'fromToken';
        const oppositeToken = this.form.value[oppositeTokenType];

        const image = await this.fetchTokenImage(blockchainToken);

        this.customToken = {
          ...blockchainToken,
          rank: 0,
          image,
          amount,
          price: 0,
          usedInIframe: true,
          available:
            !oppositeToken ||
            this.blockchain === oppositeToken.blockchain ||
            TokensSelectComponent.allowInCrossChain(
              blockchainToken.blockchain,
              oppositeToken.blockchain
            ),
          favorite: false
        };

        this.cdr.markForCheck();
      }
    }
  }

  /**
   * Fetch token images from Web3.
   * @param token Token to display.
   * @return Promise<string> Token image url.
   */
  private fetchTokenImage(token: BlockchainToken): Promise<string> {
    const blockchains = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'smartchain',
      [BLOCKCHAIN_NAME.POLYGON]: 'polygon'
    };
    const defaultImage = 'assets/images/icons/coins/default-token-ico.svg';
    if (BlockchainPublicService.isEthLikeBlockchain(token.blockchain)) {
      const image = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${
        blockchains[token.blockchain as keyof typeof blockchains]
      }/assets/${Web3Public.toChecksumAddress(token.address)}/logo.png`;

      return this.httpClient
        .get(image)
        .pipe(
          mapTo(image),
          catchError((err: HttpErrorResponse) => {
            return err.status === 200 ? of(image) : of(defaultImage);
          })
        )
        .toPromise();
    }
    return of(defaultImage).toPromise();
  }

  /**
   * Fetch new page tokens.
   */
  public fetchNewPageTokens(): void {
    if (!this.useTestingModeService.isTestingMode.getValue()) {
      this.tokensListLoading = true;
      this.tokensService.fetchNetworkTokens(
        this.blockchain as PAGINATED_BLOCKCHAIN_NAME,
        150,
        () => {
          this.tokensListLoading = false;
          this.cdr.detectChanges();
        }
      );
    }
  }

  /**
   * Tries to parse search query and fetch tokens form backend or web3.
   */
  private async tryParseQuery(): Promise<void> {
    if (this.query.length) {
      const backendTokens = await this.tokensService
        .fetchQueryTokens(this.query, this.blockchain as PAGINATED_BLOCKCHAIN_NAME)
        .toPromise();
      if (backendTokens.size) {
        const availableTokens = backendTokens
          .map(el => {
            // @TODO fix
            return {
              ...el,
              available: true,
              amount: new BigNumber(0)
            };
          })
          .toArray();
        this.tokensToShow$.next(availableTokens);
      } else {
        await this.tryParseQueryAsCustomToken();
      }
    }
  }
}
