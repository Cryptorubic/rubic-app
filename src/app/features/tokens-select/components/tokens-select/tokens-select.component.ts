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
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  Observable,
  of,
  Subject,
  Subscription
} from 'rxjs';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  mapTo,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { TokensListComponent } from 'src/app/features/tokens-select/components/tokens-list/tokens-list.component';
import {
  PAGINATED_BLOCKCHAIN_NAME,
  TokensNetworkState
} from 'src/app/shared/models/tokens/paginated-tokens';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { supportedCrossChainSwapBlockchains } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { TokensListType } from 'src/app/features/tokens-select/models/TokensListType';
import { DEFAULT_TOKEN_IMAGE } from 'src/app/shared/constants/tokens/DEFAULT_TOKEN_IMAGE';
import { compareTokens } from '@shared/utils/utils';

type ComponentInput = {
  tokens$: Observable<AvailableTokenAmount[]>;
  favoriteTokens$: Observable<AvailableTokenAmount[]>;
  formType: 'from' | 'to';
  currentBlockchain: BLOCKCHAIN_NAME;
  form: FormGroup<ISwapFormInput>;
  allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;
  idPrefix: string;
};

type ComponentContext = TuiDialogContext<AvailableTokenAmount, ComponentInput>;

@Component({
  selector: 'polymorpheus-tokens-select',
  templateUrl: './tokens-select.component.html',
  styleUrls: ['./tokens-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensSelectComponent implements OnInit {
  @ViewChild(TokensListComponent) private tokensList: TokensListComponent;

  public idPrefix: string;

  /**
   * Form containing selected tokens and blockchains.
   */
  private form: FormGroup<ISwapFormInput>;

  private formType: 'from' | 'to';

  public allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  /**
   * Current selected blockchain in modal.
   */
  private _blockchain: BLOCKCHAIN_NAME;

  /**
   * Defines whether default or favorite tokens are shown.
   */
  public listType: TokensListType;

  /**
   * True when tokens are being searched by query.
   */
  public searchQueryLoading: boolean;

  /**
   * List of all available tokens.
   */
  private tokens$: Observable<AvailableTokenAmount[]>;

  /**
   * List of available favorite tokens.
   */
  private favoriteTokens$: Observable<AvailableTokenAmount[]>;

  /**
   * Contains default tokens to display.
   */
  private tokensToShowSubject$: BehaviorSubject<AvailableTokenAmount[]>;

  get tokensToShow$(): Observable<AvailableTokenAmount[]> {
    return this.tokensToShowSubject$.asObservable();
  }

  /**
   * Contains favorite tokens to display.
   */
  private favoriteTokensToShowSubject$: BehaviorSubject<AvailableTokenAmount[]>;

  get favoriteTokensToShow$(): Observable<AvailableTokenAmount[]> {
    return this.favoriteTokensToShowSubject$.asObservable();
  }

  /**
   * Current custom token, if user is searching for one.
   */
  public customToken: AvailableTokenAmount;

  /**
   * Currently selected token in main form.
   */
  public currentlySelectedToken: TokenAmount;

  /**
   * Backend-api state of tokens in blockchains.
   */
  public tokensNetworkState: TokensNetworkState;

  /**
   * True when new tokens are being loaded from backend.
   */
  public tokensListUpdating: boolean;

  /**
   * Emits new event to update tokens list using {@link searchQuery}.
   */
  private readonly searchQuery$: BehaviorSubject<string>;

  /**
   * Emits new event to request tokens from APIs by {@link searchQuery}.
   */
  private updateTokensByQuery$: Subject<void>;

  private updateTokensByQuerySubscription$: Subscription;

  get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  set blockchain(value: BLOCKCHAIN_NAME) {
    if (value && value !== this.blockchain) {
      this.setNewBlockchain(value);
      if (this.tokensList?.scrollSubject$?.value) {
        this.tokensList.scrollSubject$.value.scrollToIndex(0);
      }
    }
  }

  get searchQuery(): string {
    return this.searchQuery$.value;
  }

  set searchQuery(value: string) {
    this.searchQuery$.next(value);
  }

  /**
   * Checks if tokens pair is allowed to trade through cross-chain.
   * @param fromBlockchain From token blockchain.
   * @param toBlockchain To token blockchain.
   * @return boolean If token is allowed in cross-chain returns true, otherwise false.
   */
  static allowedInCrossChain(
    fromBlockchain: BLOCKCHAIN_NAME,
    toBlockchain: BLOCKCHAIN_NAME
  ): boolean {
    const availableNetworks = supportedCrossChainSwapBlockchains;
    return (
      availableNetworks.some(availableNetwork => availableNetwork === fromBlockchain) &&
      availableNetworks.some(availableNetwork => availableNetwork === toBlockchain)
    );
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: ComponentContext,
    private readonly cdr: ChangeDetectorRef,
    private readonly web3PublicService: Web3PublicService,
    private readonly httpClient: HttpClient,
    private readonly tokensService: TokensService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.searchQueryLoading = false;

    this.listType = 'default';
    this.tokensToShowSubject$ = new BehaviorSubject([]);
    this.favoriteTokensToShowSubject$ = new BehaviorSubject([]);
    this.tokensListUpdating = false;

    this.searchQuery$ = new BehaviorSubject('');
    this.updateTokensByQuery$ = new Subject();

    this.initiateContextParams(context.data);
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  /**
   * Sets component input parameters.
   * @param context Component context.
   */
  private initiateContextParams(context: ComponentInput): void {
    this.idPrefix = context.idPrefix;
    this.form = context.form;
    this.formType = context.formType;
    this.allowedBlockchains = context.allowedBlockchains;
    this._blockchain = context.currentBlockchain;
    this.tokens$ = context.tokens$;
    this.favoriteTokens$ = context.favoriteTokens$;
    this.currentlySelectedToken =
      this.form.value[this.formType === 'from' ? 'fromToken' : 'toToken'];
  }

  /**
   * Inits subscriptions for tokens and searchQuery.
   */
  private initSubscriptions(): void {
    const changeFn = (prev: AvailableTokenAmount[], cur: AvailableTokenAmount[]) =>
      cur.length === prev.length;
    combineLatest([
      this.favoriteTokens$.pipe(distinctUntilChanged(changeFn)),
      this.tokens$.pipe(distinctUntilChanged(changeFn))
    ])
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => this.updateTokensList());

    this.searchQuery$.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe(() => {
      this.updateTokensList(true);
    });

    this.tokensService.tokensNetworkState$
      .pipe(
        watch(this.cdr),
        tap((tokensNetworkState: TokensNetworkState) => {
          this.tokensNetworkState = tokensNetworkState;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  /**
   * Switches tokens display mode (default or favorite).
   */
  public switchMode(): void {
    this.searchQuery = '';
    if (this.listType === 'default') {
      this.listType = 'favorite';
    } else {
      this.listType = 'default';
    }
  }

  /**
   * Sets new blockchain.
   * @param blockchain Current blockchain.
   */
  private setNewBlockchain(blockchain: BLOCKCHAIN_NAME): void {
    this._blockchain = blockchain;

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
   * Handles token selection event.
   * @param selectedToken Selected token.
   */
  public selectToken(selectedToken: AvailableTokenAmount): void {
    this.context.completeWith(selectedToken);
  }

  /**
   * Updates default and favourite tokens lists.
   */
  private updateTokensList(shouldSearch?: boolean): void {
    this.customToken = null;

    if (!this.updateTokensByQuerySubscription$) {
      this.handleQuerySubscription();
    }

    if (shouldSearch && this.searchQuery.length && this.listType === 'default') {
      this.updateTokensByQuery$.next();
    } else if (this.searchQuery.length && this.listType === 'favorite') {
      this.filterFavoriteTokens();
    } else if (this.searchQuery.length && this.listType === 'default') {
      this.filterDefaultTokens();
    } else if (!this.searchQuery.length) {
      this.sortTokens();
    }
  }

  /**
   * Handles search query requests to APIs.
   */
  private handleQuerySubscription(): void {
    this.updateTokensByQuerySubscription$ = this.updateTokensByQuery$
      .pipe(
        tap(() => {
          this.searchQueryLoading = true;
          this.cdr.detectChanges();
        }),
        switchMap(() => this.tryParseQueryAsBackendTokens()),
        switchMap(async backendTokens => {
          if (backendTokens?.length) {
            const tokensWithFavorite = backendTokens.map(
              token =>
                ({
                  ...token,
                  favorite: this.favoriteTokensToShowSubject$.value.some(favoriteToken =>
                    compareTokens(token, favoriteToken)
                  )
                } as AvailableTokenAmount)
            );
            return { backendTokens: tokensWithFavorite, customToken: null };
          }
          const customToken = await this.tryParseQueryAsCustomToken();
          return { tokens: null, customToken };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(({ backendTokens, customToken }) => {
        if (backendTokens) {
          this.tokensToShowSubject$.next(backendTokens);
        } else {
          this.customToken = customToken;
        }
        this.searchQueryLoading = false;
        this.cdr.markForCheck();
      });
  }

  /**
   * Map default tokens list with favorite.
   */
  private filterDefaultTokens(): void {
    this.favoriteTokens$.subscribe(favoriteTokens => {
      const tokens = this.tokensToShowSubject$.value.map(token => ({
        ...token,
        favorite: favoriteTokens.some(favoriteToken => compareTokens(favoriteToken, token))
      }));
      this.tokensToShowSubject$.next(tokens);
    });
  }

  /**
   * Filters favorite tokens by blockchain and query.
   */
  private filterFavoriteTokens(): void {
    this.favoriteTokens$.subscribe(favoriteTokens => {
      const query = this.searchQuery.toLowerCase();
      const currentBlockchainTokens = favoriteTokens.filter(
        el => el.blockchain === this.blockchain
      );

      if (query.startsWith('0x')) {
        const tokens = currentBlockchainTokens.filter(token =>
          token.address.toLowerCase().includes(query)
        );
        this.favoriteTokensToShowSubject$.next(tokens);
      } else {
        const symbolMatchingTokens = currentBlockchainTokens.filter(token =>
          token.symbol.toLowerCase().includes(query)
        );
        const nameMatchingTokens = currentBlockchainTokens.filter(
          token =>
            token.name.toLowerCase().includes(query) &&
            symbolMatchingTokens.every(item => item.address !== token.address)
        );

        this.favoriteTokensToShowSubject$.next(symbolMatchingTokens.concat(nameMatchingTokens));
      }
      this.cdr.detectChanges();
    });
  }

  /**
   * Sorts tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return AvailableTokenAmount[] Filtered and sorted tokens.
   */
  private sortTokensByComparator(tokens: AvailableTokenAmount[]): AvailableTokenAmount[] {
    const comparator = (a: AvailableTokenAmount, b: AvailableTokenAmount) => {
      const amountsDelta = b.amount
        .multipliedBy(b.price)
        .minus(a.amount.multipliedBy(a.price))
        .toNumber();
      return Number(b.available) - Number(a.available) || amountsDelta || b.rank - a.rank;
    };
    return tokens.sort(comparator);
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(): Observable<AvailableTokenAmount[]> {
    if (this.searchQuery) {
      return this.tokensService
        .fetchQueryTokens(this.searchQuery, this.blockchain as PAGINATED_BLOCKCHAIN_NAME)
        .pipe(
          map(backendTokens => {
            if (backendTokens.size) {
              return backendTokens
                .map(el => {
                  return {
                    ...el,
                    available: true,
                    amount: new BigNumber(NaN),
                    favorite: false
                  };
                })
                .toArray();
            }
            return [];
          })
        );
    }
    return null;
  }

  /**
   * Tries to parse custom token by search query requesting Web3.
   */
  private async tryParseQueryAsCustomToken(): Promise<AvailableTokenAmount> {
    if (this.searchQuery) {
      const web3Public: Web3Public = this.web3PublicService[this.blockchain];

      if (!Web3Public.isAddressCorrect(this.searchQuery)) {
        return null;
      }

      const blockchainToken: BlockchainToken = await web3Public
        .getTokenInfo(this.searchQuery)
        .catch(() => null);

      if (blockchainToken?.name && blockchainToken?.symbol && blockchainToken?.decimals != null) {
        const oppositeTokenType = this.formType === 'from' ? 'toToken' : 'fromToken';
        const oppositeToken = this.form.value[oppositeTokenType];

        const image = await this.fetchTokenImage(blockchainToken);

        return {
          ...blockchainToken,
          image,
          rank: 0,
          amount: new BigNumber(NaN),
          price: 0,
          usedInIframe: true,
          available:
            !oppositeToken ||
            this.blockchain === oppositeToken.blockchain ||
            TokensSelectComponent.allowedInCrossChain(
              blockchainToken.blockchain,
              oppositeToken.blockchain
            ),
          favorite: false
        };
      }
    }
    return null;
  }

  /**
   * Fetches token's image url.
   * @param token Token to display.
   * @return Promise<string> Token image url.
   */
  private fetchTokenImage(token: BlockchainToken): Promise<string> {
    const blockchains = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'smartchain',
      [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
      [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver'
    };
    const image = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${
      blockchains[token.blockchain as keyof typeof blockchains]
    }/assets/${Web3Public.toChecksumAddress(token.address)}/logo.png`;

    return this.httpClient
      .get(image)
      .pipe(
        mapTo(image),
        catchError((err: unknown) => {
          return (err as HttpErrorResponse)?.status === 200 ? of(image) : of(DEFAULT_TOKEN_IMAGE);
        })
      )
      .toPromise();
  }

  /**
   * Fetches new tokens page.
   */
  public fetchNewPageTokens(): void {
    if (!this.useTestingModeService.isTestingMode.getValue()) {
      this.tokensListUpdating = true;
      this.tokensService.fetchNetworkTokens(this.blockchain as PAGINATED_BLOCKCHAIN_NAME);
    }
  }

  /**
   * Sorts favorite and default lists of tokens.
   */
  private sortTokens(): void {
    forkJoin([this.tokens$.pipe(first()), this.favoriteTokens$.pipe(first())])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([tokens, favoriteTokens]) => {
        const currentBlockchainTokens = tokens.filter(
          (token: AvailableTokenAmount) => token.blockchain === this.blockchain
        );
        const sortedTokens = this.sortTokensByComparator(currentBlockchainTokens);
        const tokensWithFavorite = sortedTokens.map(token => ({
          ...token,
          favorite: favoriteTokens.some(favoriteToken =>
            TokensService.areTokensEqual(favoriteToken, token)
          )
        }));

        const currentBlockchainFavoriteTokens = favoriteTokens.filter(
          (token: AvailableTokenAmount) => token.blockchain === this.blockchain
        );
        const sortedFavoriteTokens = this.sortTokensByComparator(currentBlockchainFavoriteTokens);

        this.tokensToShowSubject$.next(tokensWithFavorite);
        this.favoriteTokensToShowSubject$.next(
          sortedFavoriteTokens.map(el => ({
            ...el,
            favorite: true,
            amount: el.amount || new BigNumber(NaN)
          }))
        );
        this.tokensListUpdating = false;
        this.cdr.markForCheck();
      });
  }
}
