import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
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
  Subject
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  retry,
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
import { LiquidityProvidingNotificationService } from './liquidity-providing-notification.service';
import { EthLikeWeb3Public } from '@app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';

@Injectable()
export class LiquidityProvidingService {
  private readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  private readonly lpContractAddress = ENVIRONMENT.lpProviding.contractAddress;

  private readonly brbcAddress = ENVIRONMENT.lpProviding.brbcAddress;

  private readonly usdcAddress = ENVIRONMENT.lpProviding.usdcAddress;

  private readonly whitelist = ENVIRONMENT.lpProviding.whitelist;

  public readonly minEnterAmount = ENVIRONMENT.lpProviding.minEnterAmount;

  public readonly maxEnterAmount = ENVIRONMENT.lpProviding.maxEnterAmount;

  public readonly poolSize = ENVIRONMENT.lpProviding.poolSize;

  private readonly duration = ENVIRONMENT.lpProviding.duration;

  private readonly whitelistDuration = ENVIRONMENT.lpProviding.whitelistDuration;

  public endDate: Date;

  public isLpEneded: boolean;

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

  private readonly _balance$ = new BehaviorSubject<BigNumber>(undefined);

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

  public whitelistEndTime: Date;

  public isPoolFull: boolean = false;

  private waitForReceipt = (hash: string): Observable<TransactionReceipt> => {
    return interval(3000).pipe(
      switchMap(async () => {
        const tx = await this.web3PublicService[this.blockchain].getTransactionReceipt(hash);
        return tx;
      }),
      filter<TransactionReceipt>(Boolean),
      tap(receipt => {
        if (receipt.status === false) {
          this.lpNotificationService.showErrorNotification(receipt.transactionHash);
        }
      }),
      take(1)
    );
  };

  get blockchainAdapter(): EthLikeWeb3Public {
    return this.web3PublicService[this.blockchain];
  }

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: PrivateBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService,
    private readonly router: Router,
    private readonly lpNotificationService: LiquidityProvidingNotificationService
  ) {
    this.watchWhitelist().subscribe();
  }

  public getStatistics(): Observable<unknown> {
    return this.userAddress$.pipe(
      switchMap(user => {
        if (user?.address) {
          return forkJoin([
            this.getTotalRewards(),
            this.getTotalCollectedRewards(),
            this.getUserTotalStaked(),
            this.getTotalStaked()
          ]);
        } else {
          this.setStatisticsLoading(false);
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

  public getAprAndTotalStaked(): Observable<[string, BigNumber]> {
    this.setStatisticsLoading(true);
    return forkJoin([this.getApr(), this.getTotalStaked()]).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      })
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
          retry(3),
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
        const isWhitelistUser = this.whitelist.includes(this?.userAddress?.toLowerCase());
        this._isWhitelistInProgress$.next(isWhitelistInProgress);
        this._isWhitelistUser$.next(isWhitelistUser);

        if (!isWhitelistUser && isWhitelistInProgress && this.router.url.includes('deposit')) {
          this.router.navigate(['liquidity-providing']);
        }
      }),
      takeUntil(this._stopWhitelistWatch$)
    );
  }

  public stopWatchWhitelist(): void {
    this._stopWhitelistWatch$.next();
  }

  public checkIsWhitelistUser(userAddress: string): boolean {
    return this.whitelist.includes(userAddress?.toLowerCase());
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
            return { ...deposit, isStaked: false, canWithdraw: false };
          } else {
            return deposit;
          }
        });
        this.lpNotificationService.showSuccessWithdrawRequestNotification();
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
      switchMap((hash: string) => this.waitForReceipt(hash)),
      switchMap(receipt => {
        if (receipt.status === false) {
          return EMPTY;
        } else {
          return this.getAndUpdatePoolTokensBalances();
        }
      })
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
      switchMap((hash: string) => this.waitForReceipt(hash as string)),
      switchMap(receipt => {
        if (receipt.status === false) {
          return EMPTY;
        } else {
          return this.getDeposits().pipe(take(1));
        }
      })
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
      switchMap((hash: string) => this.waitForReceipt(hash as string)),
      switchMap(receipt => {
        if (receipt.status === false) {
          return EMPTY;
        } else {
          return this.getDeposits().pipe(take(1));
        }
      })
    );
  }

  public getStartAndEndTime(): Observable<string[]> {
    return forkJoin([
      from(
        this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod<string>(
          this.lpContractAddress,
          LP_PROVIDING_CONTRACT_ABI,
          'startTime'
        )
      ),
      from(
        this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod<string>(
          this.lpContractAddress,
          LP_PROVIDING_CONTRACT_ABI,
          'endTime'
        )
      )
    ]).pipe(
      tap(([startTime, endTime]) => {
        const whitelistEndTimestamp = +startTime + this.whitelistDuration;
        this.endDate = new Date(+endTime * 1000);
        this.isLpEneded = new Date() > this.endDate;
        this.whitelistEndTime = new Date(whitelistEndTimestamp * 1000);
      })
    );
  }

  public transfer(tokenId: string, address: string): Observable<unknown> {
    return from(
      this.web3PrivateService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].tryExecuteContractMethod(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'transfer',
        [address, tokenId]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return EMPTY;
      }),
      switchMap(() => this.getDeposits().pipe(take(1)))
    );
  }

  public checkDepositErrors(
    amount: BigNumber,
    token: { balance: BigNumber; symbol: PoolToken }
  ): LpFormError | null {
    const totalStaked = this._totalStaked$.getValue();

    if (this.isLpEneded) {
      return LpFormError.LP_ENDED;
    }

    if (this.poolSize - totalStaked < this.minEnterAmount) {
      return LpFormError.POOL_FULL;
    }

    if (amount.gt(this.currentMaxLimit)) {
      return LpFormError.LIMIT_GT_MAX;
    }

    if (amount.lt(this.minEnterAmount)) {
      return LpFormError.LIMIT_LT_MIN;
    }

    if (token.balance && amount.gt(token.balance)) {
      if (token.symbol === PoolToken.BRBC) {
        return LpFormError.INSUFFICIENT_BALANCE_BRBC;
      } else {
        return LpFormError.INSUFFICIENT_BALANCE_USDC;
      }
    }

    if (!amount.isFinite()) {
      return LpFormError.EMPTY_AMOUNT;
    }

    return null;
  }

  public async calculateBrbcUsdPrice(value: BigNumber): Promise<BigNumber> {
    const usdPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: this.brbcAddress,
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

  public async switchNetwork(): Promise<boolean> {
    return await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
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
      tap(async userTotalStaked => {
        const brbcUsdcPrice = await this.tokensService.getAndUpdateTokenPrice({
          address: this.brbcAddress,
          blockchain: this.blockchain
        });
        const balance = userTotalStaked.plus(userTotalStaked.multipliedBy(brbcUsdcPrice));
        this._userTotalStaked$.next(Number(userTotalStaked.toFixed(2)));
        this._balance$.next(balance);
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
      tap(totalStaked => {
        this.checkIsPoolFull(totalStaked.toNumber());
        this._totalStaked$.next(totalStaked.toNumber());
      })
    );
  }

  private parseDeposits(deposits: DepositsResponse): TokenLpParsed[] {
    const { parsedArrayOfTokens, collectedRewards, rewardsToCollect, isWithdrawable } = deposits;

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
        canWithdraw: Boolean(isWithdrawable[i]),
        start,
        period
      };
    });
  }

  private checkIsPoolFull(totalStaked: number): boolean {
    return this.poolSize - totalStaked > this.minEnterAmount;
  }

  private parseApr(apr: string): number {
    return Number(apr) / Math.pow(10, 29);
  }
}
