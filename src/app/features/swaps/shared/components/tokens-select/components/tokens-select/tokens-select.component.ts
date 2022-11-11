import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Self,
  ViewChild
} from '@angular/core';
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
import {
  BlockchainName,
  BLOCKCHAIN_NAME,
  compareAddresses,
  EvmWeb3Pure,
  Token,
  BlockchainsInfo
} from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapFormInput } from '@shared/models/swaps/swap-form';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  mapTo,
  skip,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { TokensListComponent } from '@features/swaps/shared/components/tokens-select/components/tokens-list/tokens-list.component';
import { TokensNetworkState } from '@shared/models/tokens/paginated-tokens';
import { compareTokens } from '@shared/utils/utils';
import { TokensListType } from '@features/swaps/shared/components/tokens-select/models/tokens-list-type';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import { DOCUMENT } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';

type ComponentInput = {
  tokens$: Observable<AvailableTokenAmount[]>;
  favoriteTokens$: Observable<AvailableTokenAmount[]>;
  formType: 'from' | 'to';
  currentBlockchain: BlockchainName;
  form: FormGroup<ISwapFormInput>;
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
export class TokensSelectComponent implements OnInit, OnDestroy {
  @ViewChild(TokensListComponent) private tokensList: TokensListComponent;

  public idPrefix: string;

  /**
   * Form containing selected tokens and blockchains.
   */
  private form: FormGroup<ISwapFormInput>;

  public formType: 'from' | 'to';

  /**
   * Current selected blockchain in modal.
   */
  private _blockchain: BlockchainName;

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
  private _tokensToShow$: BehaviorSubject<AvailableTokenAmount[]> = new BehaviorSubject([]);

  public readonly tokensToShow$ = this._tokensToShow$.asObservable();

  /**
   * Contains favorite tokens to display.
   */
  private favoriteTokensToShowSubject$: BehaviorSubject<AvailableTokenAmount[]> =
    new BehaviorSubject([]);

  public readonly favoriteTokensToShow$ = this.favoriteTokensToShowSubject$.asObservable();

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
  private readonly searchQuery$: BehaviorSubject<string> = new BehaviorSubject('');

  /**
   * Emits new event to request tokens from APIs by {@link searchQuery}.
   */
  private updateTokensByQuery$: Subject<void> = new Subject();

  private updateTokensByQuerySubscription$: Subscription;

  get blockchain(): BlockchainName {
    return this._blockchain;
  }

  set blockchain(value: BlockchainName) {
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

  public readonly iframeTokenSearch = this.iframeService.tokenSearch;

  public readonly iframeRubicLink = this.iframeService.rubicLink;

  public readonly isHorizontalIframe = this.iframeService.iframeAppearance === 'horizontal';

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: ComponentContext,
    private readonly cdr: ChangeDetectorRef,
    private readonly httpClient: HttpClient,
    private readonly tokensService: TokensService,
    private readonly iframeService: IframeService,
    private readonly crossChainService: CrossChainCalculationService,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.searchQueryLoading = false;
    this.listType = 'default';
    this.tokensListUpdating = false;
    this.initiateContextParams(context.data);
  }

  ngOnInit(): void {
    this.setWindowHeight();
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
  }

  /**
   * Sets window height through html class name, to prevent broken scroll in Safari.
   */
  private setWindowHeight(): void {
    this.document.documentElement.style.setProperty(
      '--window-inner-height',
      `${window.innerHeight}px`
    );
    this.document.documentElement.classList.add('is-locked');
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }

  /**
   * Sets component input parameters.
   * @param context Component context.
   */
  private initiateContextParams(context: ComponentInput): void {
    this.idPrefix = context.idPrefix;
    this.form = context.form;
    this.formType = context.formType;
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

    this.searchQuery$
      .pipe(
        skip(1),
        debounceTime(500),
        tap(() => (this.searchQueryLoading = true)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateTokensList();
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
   * Clears token search query.
   */
  public onBlockchainChange(): void {
    this.searchQuery = '';
  }

  /**
   * Sets new blockchain.
   * @param blockchain Current blockchain.
   */
  private setNewBlockchain(blockchain: BlockchainName): void {
    this._blockchain = blockchain;

    const tokenType = this.formType === 'from' ? 'fromToken' : 'toToken';
    if (!this.form.value[tokenType]) {
      const blockchainType = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
      this.form.patchValue({
        [blockchainType]: this._blockchain
      });
    }
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
  private updateTokensList(): void {
    if (!this.updateTokensByQuerySubscription$) {
      this.handleQuerySubscription();
    }

    if (this.searchQuery.length) {
      if (this.listType === 'default') {
        this.updateTokensByQuery$.next();
      } else {
        this.filterFavoriteTokens();
      }
    } else {
      this.sortTokens();
      this.customToken = null;
    }

    this.searchQueryLoading = false;
  }

  /**
   * Handles search query requests to APIs.
   */
  private handleQuerySubscription(): void {
    if (this.updateTokensByQuerySubscription$) {
      return;
    }

    this.updateTokensByQuerySubscription$ = this.updateTokensByQuery$
      .pipe(
        tap(() => {
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
          this._tokensToShow$.next(backendTokens);
        } else if (customToken) {
          this.customToken = customToken;
        } else {
          this._tokensToShow$.next([]);
        }
        this.searchQueryLoading = false;
        this.cdr.markForCheck();
      });
  }

  /**
   * Filters favorite tokens by blockchain and query.
   */
  private filterFavoriteTokens(): void {
    this.favoriteTokens$.subscribe(favoriteTokens => {
      const query = this.searchQuery.toLowerCase();
      const currentBlockchainTokens = favoriteTokens
        .filter(el => el.blockchain === this.blockchain)
        .map(el => ({
          ...el,
          favorite: true
        }));

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
      this.cdr.markForCheck();
    });
  }

  /**
   * Sorts tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return AvailableTokenAmount[] Filtered and sorted tokens.
   */
  private sortTokensByComparator(tokens: AvailableTokenAmount[]): AvailableTokenAmount[] {
    const comparator = (a: AvailableTokenAmount, b: AvailableTokenAmount) => {
      const aAmount = a.amount.isFinite() ? a.amount : new BigNumber(0);
      const bAmount = b.amount.isFinite() ? b.amount : new BigNumber(0);
      const amountsDelta = bAmount.minus(aAmount).toNumber();
      return Number(b.available) - Number(a.available) || amountsDelta || b.rank - a.rank;
    };
    return tokens.sort(comparator);
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(): Observable<AvailableTokenAmount[]> {
    if (this.searchQuery) {
      return this.tokensService.fetchQueryTokens(this.searchQuery, this.blockchain).pipe(
        map(backendTokens => {
          const oppositeSelectedToken =
            this.formType === 'from'
              ? this.form.controls.toToken.value
              : this.form.controls.fromToken.value;

          if (backendTokens.size) {
            return backendTokens
              .filter(el => {
                return (
                  !oppositeSelectedToken ||
                  this.isCrossChainSwap() ||
                  !compareAddresses(oppositeSelectedToken.address, el.address)
                );
              })
              .map(el => {
                return {
                  ...el,
                  available: true,
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
    try {
      if (this.searchQuery) {
        const token = await Token.createToken({
          blockchain: this.blockchain,
          address: this.searchQuery
        });

        if (token?.name && token?.symbol && token?.decimals != null) {
          const oppositeTokenType = this.formType === 'from' ? 'toToken' : 'fromToken';
          const oppositeToken = this.form.value[oppositeTokenType];

          const image = await this.fetchTokenImage(token);

          return {
            ...token,
            image,
            rank: 0,
            amount: new BigNumber(NaN),
            price: 0,
            available:
              !oppositeToken ||
              this.blockchain === oppositeToken.blockchain ||
              this.crossChainService.areSupportedBlockchains(
                token.blockchain,
                oppositeToken.blockchain
              ),
            favorite: this.favoriteTokensToShowSubject$.value.some(favoriteToken =>
              compareTokens(favoriteToken, token)
            )
          };
        }
      }
    } catch {
      return null;
    }
  }

  /**
   * Fetches token's image url.
   * @param token Token to display.
   * @return Promise<string> Token image url.
   */
  private async fetchTokenImage(token: BlockchainToken): Promise<string> {
    const blockchains: Record<BlockchainName, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'smartchain',
      [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
      [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
      [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
      [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
      [BLOCKCHAIN_NAME.AURORA]: 'aurora',
      [BLOCKCHAIN_NAME.TELOS]: 'telos',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
      [BLOCKCHAIN_NAME.SOLANA]: 'solana',
      [BLOCKCHAIN_NAME.NEAR]: 'near',
      [BLOCKCHAIN_NAME.OPTIMISM]: 'optimism',
      [BLOCKCHAIN_NAME.CRONOS]: 'cronos',
      [BLOCKCHAIN_NAME.OKE_X_CHAIN]: null,
      [BLOCKCHAIN_NAME.GNOSIS]: 'xdai',
      [BLOCKCHAIN_NAME.FUSE]: null,
      [BLOCKCHAIN_NAME.MOONBEAM]: 'moonbeam',
      [BLOCKCHAIN_NAME.CELO]: 'celo',
      [BLOCKCHAIN_NAME.BOBA]: 'boba',
      [BLOCKCHAIN_NAME.ASTAR]: 'astar',
      [BLOCKCHAIN_NAME.BITCOIN]: 'bitcoin',
      [BLOCKCHAIN_NAME.ETHEREUM_POW]: 'ethereum-pow',
      [BLOCKCHAIN_NAME.TRON]: 'tron',
      [BLOCKCHAIN_NAME.KAVA]: 'kava',
      [BLOCKCHAIN_NAME.BITGERT]: 'bitgert'
    };

    if (!blockchains[token.blockchain]) {
      return DEFAULT_TOKEN_IMAGE;
    }

    const tokenAddress = BlockchainsInfo.isEvmBlockchainName(token.blockchain)
      ? EvmWeb3Pure.toChecksumAddress(token.address)
      : token.address;
    const image = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${
      blockchains[token.blockchain]
    }/assets/${tokenAddress}/logo.png`;

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
    this.tokensListUpdating = true;
    this.tokensService.fetchNetworkTokens(this.blockchain, () => {
      this.tokensListUpdating = false;
      this.cdr.detectChanges();
    });
  }

  /**
   * Sorts favorite and default lists of tokens.
   */
  private sortTokens(): void {
    forkJoin([this.tokens$.pipe(first()), this.favoriteTokens$.pipe(first())]).subscribe(
      ([tokens, favoriteTokens]) => {
        const currentBlockchainTokens = tokens.filter(
          (token: AvailableTokenAmount) => token.blockchain === this.blockchain
        );
        const sortedTokens = this.sortTokensByComparator(currentBlockchainTokens);
        const tokensWithFavorite = sortedTokens.map(token => ({
          ...token,
          amount: token.amount || new BigNumber(NaN),
          favorite: favoriteTokens.some(favoriteToken =>
            TokensService.areTokensEqual(favoriteToken, token)
          )
        }));

        const currentBlockchainFavoriteTokens = favoriteTokens
          .filter((token: AvailableTokenAmount) => token.blockchain === this.blockchain)
          .map(token => ({
            ...token,
            favorite: true,
            amount: token.amount || new BigNumber(NaN)
          }));
        const sortedFavoriteTokens = this.sortTokensByComparator(currentBlockchainFavoriteTokens);

        this._tokensToShow$.next(tokensWithFavorite);
        this.favoriteTokensToShowSubject$.next(sortedFavoriteTokens);
        this.tokensListUpdating = false;
        this.cdr.markForCheck();
      }
    );
  }

  public isCrossChainSwap(): boolean {
    const secondBlockchain =
      this.formType === 'from'
        ? this.form.controls.toBlockchain.value
        : this.form.controls.fromBlockchain.value;
    return secondBlockchain !== this.blockchain;
  }
}
