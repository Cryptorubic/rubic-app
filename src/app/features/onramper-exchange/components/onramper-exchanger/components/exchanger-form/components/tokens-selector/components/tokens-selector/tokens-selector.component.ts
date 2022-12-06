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
import { BehaviorSubject, combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BlockchainName, BLOCKCHAIN_NAME, EvmWeb3Pure, Token, BlockchainsInfo } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  debounceTime,
  map,
  mapTo,
  skip,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensNetworkState } from '@shared/models/tokens/paginated-tokens';
import { compareTokens } from '@shared/utils/utils';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { DOCUMENT } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { TokensListType } from '@features/swaps/shared/components/tokens-selector/models/tokens-list-type';
import { TokensListComponent } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-list/tokens-list.component';

type ComponentContext = TuiDialogContext<TokenAmount, {}>;

@Component({
  selector: 'polymorpheus-tokens-select',
  templateUrl: './tokens-selector.component.html',
  styleUrls: ['./tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensSelectorComponent implements OnInit, OnDestroy {
  @ViewChild(TokensListComponent) private tokensList: TokensListComponent;

  /**
   * Defines whether default or favorite tokens are shown.
   */
  public listType: TokensListType = 'default';

  /**
   * True when tokens are being searched by query.
   */
  public searchQueryLoading: boolean = false;

  /**
   * Contains default tokens to display.
   */
  private _tokensToShow$: BehaviorSubject<TokenAmount[]> = new BehaviorSubject([]);

  public readonly tokensToShow$ = this._tokensToShow$.asObservable();

  /**
   * Contains favorite tokens to display.
   */
  private _favoriteTokensToShow$: BehaviorSubject<TokenAmount[]> = new BehaviorSubject([]);

  public readonly favoriteTokensToShow$ = this._favoriteTokensToShow$.asObservable();

  /**
   * Current custom token, if user is searching for one.
   */
  public customToken: TokenAmount;

  /**
   * Currently selected token in main form.
   */
  public selectedToken: TokenAmount | null;

  /**
   * Backend-api state of tokens in blockchains.
   */
  public tokensNetworkState: TokensNetworkState;

  /**
   * True when new tokens are being loaded from backend.
   */
  public tokensListUpdating: boolean = false;

  /**
   * Emits new event to update tokens list using {@link searchQuery}.
   */
  private readonly searchQuery$: BehaviorSubject<string> = new BehaviorSubject('');

  /**
   * Emits new event to request tokens from APIs by {@link searchQuery}.
   */
  private updateTokensByQuery$: Subject<void> = new Subject();

  private updateTokensByQuerySubscription$: Subscription;

  public blockchain: BlockchainName;

  get searchQuery(): string {
    return this.searchQuery$.value;
  }

  set searchQuery(value: string) {
    this.searchQuery$.next(value);
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: ComponentContext,
    private readonly cdr: ChangeDetectorRef,
    private readonly exchangerFormService: ExchangerFormService,
    private readonly httpClient: HttpClient,
    private readonly tokensService: TokensService,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.selectedToken = this.exchangerFormService.toToken;
    this.blockchain = this.selectedToken?.blockchain || BLOCKCHAIN_NAME.ETHEREUM;

    this.checkAndRefetchTokenList();
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
   * Inits subscriptions for tokens and searchQuery.
   */
  private initSubscriptions(): void {
    combineLatest([this.tokensService.tokens$, this.tokensService.favoriteTokens$])
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
    this.checkAndRefetchTokenList();
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensService.needRefetchTokens) {
      this.tokensService.tokensRequestParameters = undefined;
    }
  }

  /**
   * Handles token selection event.
   * @param selectedToken Selected token.
   */
  public selectToken(selectedToken: TokenAmount): void {
    this.tokensService.addToken(selectedToken);
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
        this.searchQueryLoading = false;
      }
    } else {
      this.sortTokens();
      this.customToken = null;
      this.searchQueryLoading = false;
    }
    this.cdr.detectChanges();
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
        switchMap(() => this.tryParseQueryAsBackendTokens()),
        switchMap(async backendTokens => {
          if (backendTokens?.length) {
            const tokensWithFavorite = backendTokens.map(token => ({
              ...token,
              favorite: this._favoriteTokensToShow$.value.some(favoriteToken =>
                compareTokens(token, favoriteToken)
              )
            }));
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
        this.cdr.detectChanges();
      });
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(): Observable<TokenAmount[]> {
    if (!this.searchQuery) {
      return null;
    }

    return this.tokensService.fetchQueryTokens(this.searchQuery, this.blockchain).pipe(
      map(backendTokens => {
        if (backendTokens.size) {
          return backendTokens
            .map(el => {
              return {
                ...el,
                favorite: false
              };
            })
            .toArray();
        }
        return [];
      })
    );
  }

  /**
   * Tries to parse custom token by search query requesting Web3.
   */
  private async tryParseQueryAsCustomToken(): Promise<TokenAmount> {
    try {
      if (this.searchQuery) {
        const token = await Token.createToken({
          blockchain: this.blockchain,
          address: this.searchQuery
        });

        if (token?.name && token?.symbol && token?.decimals != null) {
          const image = await this.fetchTokenImage(token);

          return {
            ...token,
            image,
            rank: 0,
            amount: new BigNumber(NaN),
            price: 0,
            favorite: this._favoriteTokensToShow$.value.some(favoriteToken =>
              compareTokens(favoriteToken, token)
            )
          };
        }
      }
    } catch {}
    return null;
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
      [BLOCKCHAIN_NAME.BITGERT]: 'bitgert',
      [BLOCKCHAIN_NAME.OASIS]: 'oasis',
      [BLOCKCHAIN_NAME.METIS]: 'metis',
      [BLOCKCHAIN_NAME.DFK]: 'defi-kingdoms',
      [BLOCKCHAIN_NAME.KLAYTN]: 'klaytn',
      [BLOCKCHAIN_NAME.VELAS]: 'velas',
      [BLOCKCHAIN_NAME.SYSCOIN]: 'syscoin'
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
   * Filters favorite tokens by blockchain and query.
   */
  private filterFavoriteTokens(): void {
    const favoriteTokens = this.tokensService.favoriteTokens.toArray();

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
      this._favoriteTokensToShow$.next(tokens);
    } else {
      const symbolMatchingTokens = currentBlockchainTokens.filter(token =>
        token.symbol.toLowerCase().includes(query)
      );
      const nameMatchingTokens = currentBlockchainTokens.filter(
        token =>
          token.name.toLowerCase().includes(query) &&
          symbolMatchingTokens.every(item => item.address !== token.address)
      );

      this._favoriteTokensToShow$.next(symbolMatchingTokens.concat(nameMatchingTokens));
    }
  }

  /**
   * Sorts favorite and default lists of tokens.
   */
  private sortTokens(): void {
    const tokens = this.tokensService.tokens.toArray();
    const favoriteTokens = this.tokensService.favoriteTokens.toArray();

    const currentBlockchainTokens = tokens.filter(token => token.blockchain === this.blockchain);
    const sortedTokens = this.sortTokensByComparator(currentBlockchainTokens);
    const tokensWithFavorite = sortedTokens.map(token => ({
      ...token,
      amount: token.amount || new BigNumber(NaN),
      favorite: favoriteTokens.some(favoriteToken =>
        TokensService.areTokensEqual(favoriteToken, token)
      )
    }));

    const currentBlockchainFavoriteTokens = favoriteTokens
      .filter(token => token.blockchain === this.blockchain)
      .map(token => ({
        ...token,
        favorite: true,
        amount: token.amount || new BigNumber(NaN)
      }));
    const sortedFavoriteTokens = this.sortTokensByComparator(currentBlockchainFavoriteTokens);

    this._tokensToShow$.next(tokensWithFavorite);
    this._favoriteTokensToShow$.next(sortedFavoriteTokens);
    this.tokensListUpdating = false;
    this.cdr.detectChanges();
  }

  /**
   * Sorts tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return TokenAmount[] Filtered and sorted tokens.
   */
  private sortTokensByComparator(tokens: TokenAmount[]): TokenAmount[] {
    const comparator = (a: TokenAmount, b: TokenAmount) => {
      const aAmount = a.amount.isFinite() ? a.amount : new BigNumber(0);
      const bAmount = b.amount.isFinite() ? b.amount : new BigNumber(0);
      const amountsDelta = bAmount.minus(aAmount).toNumber();
      return amountsDelta || b.rank - a.rank;
    };
    return tokens.sort(comparator);
  }

  /**
   * Fetches new tokens page.
   */
  public fetchNewPageTokens(): void {
    this.tokensListUpdating = true;
    this.cdr.detectChanges();
    this.tokensService.fetchNetworkTokens(this.blockchain, () => {
      this.tokensListUpdating = false;
      this.cdr.detectChanges();
    });
  }
}
