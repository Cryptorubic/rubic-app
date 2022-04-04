import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import {
  PublicBlockchainAdapterService,
  Web3SupportedBlockchains
} from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import BigNumber from 'bignumber.js';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  forkJoin,
  from,
  interval,
  Observable,
  of,
  Subject
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  scan,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';
import { LP_PROVIDING_CONTRACT_ABI } from '../constants/LP_PROVIDING_CONTRACT_ABI';
import { LpFormError } from '../models/lp-form-error.enum';
import { TransactionReceipt } from 'web3-eth';
import { ErrorsService } from '@app/core/errors/errors.service';
import { TokenLp, TokenLpParsed } from '../models/token-lp.interface';
import { DepositType } from '../models/deposit-type.enum';
import { Router } from '@angular/router';
import { PoolToken } from '../models/pool-token.enum';
import { BlockchainData } from '@app/shared/models/blockchain/blockchain-data';
import { DepositsResponse } from '../models/deposits-response.interface';
import { WHITELIST_PERIOD } from '../constants/WHITELIST_PERIOD';

@Injectable()
export class LiquidityProvidingService {
  private readonly lpContractAddress = ENVIRONMENT.lpProviding.contractAddress;

  private readonly blockchain = ENVIRONMENT.lpProviding.blockchain as Web3SupportedBlockchains;

  private readonly brbcAddress = ENVIRONMENT.lpProviding.poolTokens[PoolToken.BRBC].address;

  private readonly usdcAddress = ENVIRONMENT.lpProviding.poolTokens[PoolToken.USDC].address;

  private readonly whitelist = ENVIRONMENT.lpProviding.whitelist;

  public readonly minEnterAmount = ENVIRONMENT.lpProviding.minEnterAmount;

  public readonly maxEnterAmount = ENVIRONMENT.lpProviding.maxEnterAmount;

  public readonly poolSize = ENVIRONMENT.lpProviding.poolSize;

  public readonly userAddress$ = this.authService.getCurrentUser().pipe(
    distinctUntilChanged((x, y) => {
      return x?.address === y?.address;
    })
  );

  private get userAddress(): string {
    return this.authService.user?.address;
  }

  public readonly needLogin$ = this.authService
    .getCurrentUser()
    .pipe(map(user => !Boolean(user?.address)));

  public readonly needSwitchNetwork$ = this.walletConnectorService.networkChange$.pipe(
    startWith(this.walletConnectorService.network),
    filter<BlockchainData>(Boolean),
    map(network => network?.name !== this.blockchain)
  );

  private _usdcBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public usdcBalance$ = this._usdcBalance$.asObservable();

  private _brbcBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public brbcBalance$ = this._brbcBalance$.asObservable();

  private readonly _infoLoading$ = new BehaviorSubject<boolean>(true);

  public readonly infoLoading$ = this._infoLoading$.asObservable();

  private readonly _progressLoading$ = new BehaviorSubject<boolean>(true);

  public readonly progressLoading$ = this._progressLoading$.asObservable();

  private readonly _statisticsLoading$ = new BehaviorSubject<boolean>(true);

  public readonly statisticsLoading$ = this._statisticsLoading$.asObservable();

  private readonly _depositsLoading$ = new BehaviorSubject<boolean>(false);

  public readonly depositsLoading$ = this._depositsLoading$.asObservable();

  private readonly _deposits$ = new BehaviorSubject<TokenLpParsed[]>(undefined);

  public get deposits(): TokenLpParsed[] {
    return this._deposits$.getValue();
  }

  public readonly deposits$ = this._deposits$.asObservable();

  private readonly _totalCollectedRewards$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly totalCollectedRewards$ = this._totalCollectedRewards$.asObservable();

  private readonly _rewardsToCollect$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly rewardsToCollect$ = this._rewardsToCollect$.asObservable();

  private readonly _totalStaked$ = new BehaviorSubject<number>(0);

  public readonly totalStaked$ = this._totalStaked$.asObservable();

  private readonly _userTotalStaked$ = new BehaviorSubject<number>(0);

  public readonly userTotalStaked$ = this._userTotalStaked$.asObservable();

  private readonly _apr$ = new BehaviorSubject<number>(undefined);

  public readonly apr$ = this._apr$.asObservable();

  private readonly _balance$ = new BehaviorSubject<number>(0);

  public readonly balance$ = this._balance$.asObservable();

  private readonly _brbcAllowance$ = new Subject<BigNumber>();

  public readonly needBrbcApprove$ = this._brbcAllowance$
    .asObservable()
    .pipe(map(allowance => allowance.lt(Web3Pure.toWei(this.maxEnterAmount))));

  private readonly _usdcAllowance$ = new Subject<BigNumber>();

  public readonly needUsdcApprove$ = this._usdcAllowance$
    .asObservable()
    .pipe(map(allowance => allowance.lt(Web3Pure.toWei(this.maxEnterAmount))));

  private readonly _depositType$ = new BehaviorSubject<DepositType>(undefined);

  public readonly depositType$ = this._depositType$.asObservable();

  public get depositType(): DepositType {
    return this._depositType$.getValue();
  }

  public get currentMaxLimit(): number {
    return this.maxEnterAmount - this._userTotalStaked$.getValue();
  }

  private readonly _isWhitelistInProgress$ = new BehaviorSubject<boolean>(undefined);

  public readonly isWhitelistInProgress$ = this._isWhitelistInProgress$.asObservable();

  public get isWhitelistInProgress(): boolean {
    return this._isWhitelistInProgress$.getValue();
  }

  private readonly _isWhitelistUser$ = new BehaviorSubject<boolean>(undefined);

  public readonly isWhitelistUser$ = this._isWhitelistUser$.asObservable();

  public get isWhitelistUser(): boolean {
    return this._isWhitelistUser$.getValue();
  }

  private readonly _stopWhitelistWatch$ = new Subject<void>();

  public whitelistTimer$: Observable<unknown>;

  private waitForReceipt$ = (hash: string) => {
    return interval(3000).pipe(
      switchMap(async () => {
        const tx = await this.web3PublicService[this.blockchain].getTransactionReceipt(hash);
        console.log(tx);
        return tx;
      }),
      filter(Boolean),
      take(1)
    );
  };

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: PrivateBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService,
    private readonly router: Router
  ) {
    this.watchWhitelist().subscribe();
  }

  public getStatistics(): Observable<unknown> {
    return this.userAddress$.pipe(
      switchMap(user => {
        if (user.address) {
          return forkJoin([
            this.getTotalRewards(),
            this.getTotalCollectedRewards(),
            this.getUserTotalStaked(),
            this.getTotalStaked()
          ]);
        } else {
          return EMPTY;
        }
      }),
      catchError((error: unknown) => {
        console.error(error);
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      })
    );
  }

  private getTotalRewards(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'viewRewardsTotal',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map(response => Web3Pure.fromWei(response)),
      tap(rewards => this._rewardsToCollect$.next(rewards))
    );
  }

  private getTotalCollectedRewards(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'viewCollectedRewardsTotal',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map(response => Web3Pure.fromWei(response)),
      tap(rewards => this._totalCollectedRewards$.next(rewards))
    );
  }

  private getUserTotalStaked(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'viewUSDCAmountOf',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map(response => Web3Pure.fromWei(response)),
      tap(userTotalStaked => {
        const totalStaked = this._totalStaked$.getValue();

        this._userTotalStaked$.next(Number(userTotalStaked.toFixed(2)));
        this._balance$.next(+userTotalStaked.dividedBy(totalStaked).multipliedBy(100).toFixed(2));
      })
    );
  }

  public getAprAndTotalStaked(): Observable<[string, BigNumber]> {
    this.setStatisticsLoading(true);
    return forkJoin([this.getApr(), this.getTotalStaked()]).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      })
    );
  }

  private getApr(): Observable<string> {
    return from(
      this.web3PublicService[this.blockchain].callContractMethod<string>(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'apr'
      )
    ).pipe(tap(apr => this._apr$.next(this.parseApr(apr))));
  }

  private getTotalStaked(): Observable<BigNumber> {
    return from(
      this.web3PublicService[this.blockchain].callContractMethod<BigNumber>(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'poolUSDC'
      )
    ).pipe(
      map(response => Web3Pure.fromWei(response)),
      tap(totalStaked => this._totalStaked$.next(totalStaked.toNumber()))
    );
  }

  public setStatisticsLoading(value: boolean): void {
    this._statisticsLoading$.next(value);
  }

  public getAndUpdatePoolTokensBalances(address?: string): Observable<BigNumber[]> {
    return from(
      this.web3PublicService[this.blockchain].getTokensBalances(
        address || this.authService.userAddress,
        [this.usdcAddress, this.brbcAddress]
      )
    ).pipe(
      tap(([usdcBalance, brbcBalance]) => {
        this._usdcBalance$.next(Web3Pure.fromWei(usdcBalance));
        this._brbcBalance$.next(Web3Pure.fromWei(brbcBalance));
      })
    );
  }

  public getDeposits(): Observable<TokenLpParsed[]> {
    return this.userAddress$.pipe(
      filter(user => Boolean(user?.address)),
      tap(() => this.setDepositsLoading(true)),
      switchMap(user => {
        return from(
          this.web3PublicService[this.blockchain].callContractMethod<DepositsResponse>(
            this.lpContractAddress,
            LP_PROVIDING_CONTRACT_ABI,
            'infoAboutDepositsParsed',
            { methodArguments: [user.address], from: user.address }
          )
        ).pipe(
          catchError((error: unknown) => {
            this.errorService.catchAnyError(error as Error);
            return EMPTY;
          }),
          map(deposits => this.parseDeposits(deposits)),
          tap(deposits => {
            this._deposits$.next(deposits);
          })
        );
      })
    );
  }

  public setDepositsLoading(value: boolean): void {
    this._depositsLoading$.next(value);
  }

  public watchWhitelist(): Observable<boolean> {
    return combineLatest([this.walletConnectorService.addressChange$, this.userAddress$]).pipe(
      switchMap(() =>
        from(
          this.web3PublicService[this.blockchain].callContractMethod<boolean>(
            this.lpContractAddress,
            LP_PROVIDING_CONTRACT_ABI,
            'viewWhitelistInProgress'
          )
        )
      ),
      tap(isWhitelistInProgress => {
        this._isWhitelistInProgress$.next(isWhitelistInProgress);
        this._isWhitelistUser$.next(this.whitelist.includes(this?.userAddress?.toLowerCase()));
      }),
      takeUntil(this._stopWhitelistWatch$)
    );
  }

  public stopWatchWhitelist(): void {
    this._stopWhitelistWatch$.next();
  }

  public getNeedTokensApprove(): Observable<BigNumber[]> {
    return forkJoin([
      from(
        this.web3PublicService[this.blockchain].getAllowance({
          tokenAddress: this.usdcAddress,
          ownerAddress: this.authService.userAddress,
          spenderAddress: this.lpContractAddress
        })
      ),
      from(
        this.web3PublicService[this.blockchain].getAllowance({
          tokenAddress: this.brbcAddress,
          ownerAddress: this.authService.userAddress,
          spenderAddress: this.lpContractAddress
        })
      )
    ]).pipe(
      tap(([usdcAllowance, brbcAllowance]) => {
        this._usdcAllowance$.next(usdcAllowance);
        this._brbcAllowance$.next(brbcAllowance);
      })
    );
  }

  public approvePoolToken(token: PoolToken): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService[this.blockchain].approveTokens(
        token === PoolToken.USDC ? this.usdcAddress : this.brbcAddress,
        this.lpContractAddress,
        'infinity'
      )
    );
  }

  public approveNftToken(spenderAddress: string, nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpContractAddress,
      LP_PROVIDING_CONTRACT_ABI,
      'approve',
      [spenderAddress, nftId]
    );
  }

  public requestWithdraw(tokenId: string): Observable<unknown> {
    return from(
      this.web3PrivateService[this.blockchain].executeContractMethodWithOnHashResolve(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'requestWithdraw',
        [tokenId]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      tap(() => {
        const updatedDeposits = this.deposits.map(deposit => {
          if (deposit.tokenId === tokenId) {
            return { ...deposit, isStaked: false };
          } else {
            return deposit;
          }
        });

        this._deposits$.next(updatedDeposits);
      })
    );
  }

  public createDeposit(amount: BigNumber): Observable<BigNumber[]> {
    const depositMethod =
      this.depositType === DepositType.WHITELIST && Boolean(this.isWhitelistUser)
        ? 'whitelistStake'
        : 'stake';

    return from(
      this.web3PrivateService[this.blockchain].executeContractMethodWithOnHashResolve(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        depositMethod,
        [Web3Pure.toWei(amount)]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return of(false);
      }),
      switchMap((hash: string | boolean) => {
        if (hash !== false) {
          return this.waitForReceipt$(hash as string);
        } else {
          return EMPTY;
        }
      }),
      switchMap(() => this.getAndUpdatePoolTokensBalances())
    );
  }

  public withdraw(tokenId: string): Observable<unknown> {
    return from(
      this.web3PrivateService[this.blockchain].executeContractMethodWithOnHashResolve(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'withdraw',
        [tokenId]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      switchMap(() => this.getDeposits().pipe(take(1)))
    );
  }

  public collectRewards(tokenId: string): Observable<unknown> {
    return from(
      this.web3PrivateService[this.blockchain].executeContractMethodWithOnHashResolve(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'claimRewards',
        [tokenId]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      switchMap((hash: string) => {
        return this.waitForReceipt$(hash);
      }),
      switchMap(() => this.getDeposits()),
      take(1)
    );
  }

  public getStartTime(): Observable<string> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod<string>(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'startTime'
      )
    ).pipe(
      tap(startTime => {
        const currentTimestamp = +new Date();
        const whitelistEndTimestamp = +startTime + WHITELIST_PERIOD;
        const diff = whitelistEndTimestamp - currentTimestamp;
        this.whitelistTimer$ = interval(1000).pipe(
          scan(acc => --acc, diff),
          map(ts => new Date(ts * 1000))
        );
      })
    );
  }

  public checkDepositErrors(amount: BigNumber, balance: BigNumber): LpFormError | null {
    if (amount.gt(this.currentMaxLimit)) {
      return LpFormError.LIMIT_GT_MAX;
    }

    if (amount.lt(this.minEnterAmount)) {
      return LpFormError.LIMIT_LT_MIN;
    }

    if (balance && amount.gt(balance)) {
      return LpFormError.INSUFFICIENT_BALANCE;
    }

    if (!amount.isFinite()) {
      return LpFormError.EMPTY_AMOUNT;
    }

    return null;
  }

  public async calculateUsdPrice(value: BigNumber, token: 'brbc' | 'usdc'): Promise<BigNumber> {
    const usdPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: token === 'brbc' ? this.brbcAddress : this.usdcAddress,
      blockchain: this.blockchain
    });

    return value.multipliedBy(usdPrice);
  }

  public parseInputValue(value: string): BigNumber {
    if (value) {
      return new BigNumber(String(value).split(',').join(''));
    } else {
      return new BigNumber(NaN);
    }
  }

  public navigateToDepositForm(depositType: DepositType): void {
    this._depositType$.next(depositType);
    this.router.navigate(['liquidity-providing', 'deposit']);
  }

  private parseDeposits(deposits: DepositsResponse): TokenLpParsed[] {
    const { parsedArrayOfTokens, collectedRewards, rewardsToCollect } = deposits;

    return parsedArrayOfTokens.map((tokenInfo: TokenLp, i: number) => {
      const { startTime, deadline } = tokenInfo;
      const start = new Date(Number(startTime) * 1000);
      const period = Math.floor((Number(deadline) - Number(startTime)) / (3600 * 24));
      return {
        ...tokenInfo,
        USDCAmount: Web3Pure.fromWei(tokenInfo.USDCAmount),
        BRBCAmount: Web3Pure.fromWei(tokenInfo.BRBCAmount),
        collectedRewards: Web3Pure.fromWei(collectedRewards[i]),
        rewardsToCollect: Web3Pure.fromWei(rewardsToCollect[i]),
        start,
        period
      };
    });
  }

  public async switchNetwork(): Promise<boolean> {
    return await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }

  private parseApr(apr: string): number {
    return Number(apr) / Math.pow(10, 29);
  }
}
