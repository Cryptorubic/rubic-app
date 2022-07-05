import { Inject, Injectable, NgZone } from '@angular/core';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
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
import { NavigationEnd, Router } from '@angular/router';
import { PoolToken } from '../models/pool-token.enum';
import { BlockchainData } from '@app/shared/models/blockchain/blockchain-data';
import { DepositsResponse } from '../models/deposits-response.interface';
import { LiquidityProvidingNotificationService } from './liquidity-providing-notification.service';
import { VolumeApiService } from '@app/core/services/backend/volume-api/volume-api.service';
import { LpReward, LpRewardParsed } from '@app/core/services/backend/volume-api/models/lp-rewards';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';
import { parseWeb3Percent } from '@app/shared/utils/utils';
import { WINDOW } from '@ng-web-apis/common';
import { DEPOSIT_RATIO } from '../constants/DEPOSIT_RATIO';
import { LpProvidingConfig } from 'src/environments/constants/lp-providing';
import { BLOCKCHAIN_NAME, Web3Private, Web3Public, Web3Pure } from 'rubic-sdk';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

// TODO create env token
@Injectable()
export class LiquidityProvidingService {
  public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  get lpProviding(): LpProvidingConfig {
    return ENVIRONMENT.lpProviding;
  }

  private readonly lpContractAddress = this.lpProviding.contractAddress;

  private readonly brbcAddress = this.lpProviding.brbcAddress;

  private readonly usdcAddress = this.lpProviding.usdcAddress;

  private readonly whitelist = this.lpProviding.whitelist;

  public readonly minEnterAmount = this.lpProviding.minEnterAmount;

  public readonly maxEnterAmount = this.lpProviding.maxEnterAmount;

  public readonly maxEnterAmountWhitelist = this.lpProviding.maxEnterAmountWhitelist;

  public readonly poolSize = this.lpProviding.poolSize;

  private readonly whitelistDuration = this.lpProviding.whitelistDuration;

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

  private readonly _rewardsHistory$ = new BehaviorSubject<LpRewardParsed[]>(undefined);

  public readonly rewardsHistory$ = this._rewardsHistory$.asObservable();

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
    const userTotalStaked = this._userTotalStaked$.getValue();

    return this.isWhitelistInProgress
      ? this.maxEnterAmountWhitelist - userTotalStaked
      : this.maxEnterAmount - userTotalStaked;
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
    const publicAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);
    return interval(3000).pipe(
      switchMap(() => publicAdapter.getTransactionReceipt(hash)),
      filter<TransactionReceipt>(Boolean),
      tap(receipt => {
        if (receipt.status === false) {
          this.lpNotificationService.showErrorNotification(receipt.transactionHash);
        }
      }),
      take(1)
    );
  };

  public get blockchainAdapter(): Web3Public {
    return Injector.web3PublicService.getWeb3Public(this.blockchain);
  }

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService,
    private readonly router: Router,
    private readonly lpNotificationService: LiquidityProvidingNotificationService,
    private readonly volumeApiService: VolumeApiService,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly zone: NgZone,
    @Inject(WINDOW) private readonly window: Window
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
          return forkJoin([this.getTotalStaked(), this.getApr()]);
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
    const provider: Web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);
    return from(
      provider.getTokensBalances(address || this.authService.userAddress, [
        this.usdcAddress,
        this.brbcAddress
      ])
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
        const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(
          this.blockchain
        );
        return from(
          blockchainAdapter.callContractMethod<DepositsResponse>(
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
            this.zone.run(() => {
              this._deposits$.next(deposits);
            });
          })
        );
      })
    );
  }

  public setDepositsLoading(value: boolean): void {
    this._depositsLoading$.next(value);
  }

  public watchWhitelist(): Observable<boolean> {
    return combineLatest([
      this.walletConnectorService.addressChange$,
      this.userAddress$,
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
    ]).pipe(
      switchMap(() =>
        from(
          Injector.web3PublicService
            .getWeb3Public(this.blockchain)
            .callContractMethod<boolean>(
              this.lpContractAddress,
              LP_PROVIDING_CONTRACT_ABI,
              'viewWhitelistInProgress'
            )
        )
      ),
      tap((isWhitelistInProgress: boolean) => {
        const isWhitelistUser = this.checkIsWhitelistUser(this.userAddress);
        const isOnDepositForm = this.router.url.includes('deposit');

        this.zone.run(() => {
          this._isWhitelistInProgress$.next(isWhitelistInProgress);
          this._isWhitelistUser$.next(isWhitelistUser);
        });

        if (!isWhitelistUser && isWhitelistInProgress && isOnDepositForm) {
          this.window.location.assign(this.window.location.origin + '/liquidity-providing');
        }

        if (isWhitelistUser && isWhitelistInProgress && isOnDepositForm) {
          this.setDepositType(DepositType.WHITELIST);
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
    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);
    return forkJoin([
      from(
        blockchainAdapter.getAllowance(
          this.usdcAddress,
          this.authService.userAddress,
          this.lpContractAddress
        )
      ),
      from(
        blockchainAdapter.getAllowance(
          this.brbcAddress,
          this.authService.userAddress,
          this.lpContractAddress
        )
      )
    ]).pipe(
      tap(([usdcAllowance, brbcAllowance]) => {
        this.zone.run(() => {
          this._usdcAllowance$.next(usdcAllowance);
          this._brbcAllowance$.next(brbcAllowance);
        });
      })
    );
  }

  public approvePoolToken(token: PoolToken): Observable<TransactionReceipt> {
    const blockchainAdapter: Web3Private = Injector.web3Private;
    return from(
      blockchainAdapter.approveTokens(
        token === PoolToken.USDC ? this.usdcAddress : this.brbcAddress,
        this.lpContractAddress,
        'infinity'
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return EMPTY;
      })
    );
  }

  public requestWithdraw(tokenId: string): Observable<unknown> {
    const privateBlockchainAdapter: Web3Private = Injector.web3Private;
    return from(
      privateBlockchainAdapter.executeContractMethodWithOnHashResolve(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'requestWithdraw',
        [tokenId]
      )
    ).pipe(
      switchMap((hash: string) => this.waitForReceipt(hash)),
      switchMap(receipt => {
        if (receipt.status === false) {
          return EMPTY;
        } else {
          return of(receipt.status);
        }
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

  public createDeposit(usdcAmount: BigNumber): Observable<BigNumber[]> {
    const depositMethod =
      this.depositType === DepositType.WHITELIST && Boolean(this.isWhitelistUser)
        ? 'whitelistStake'
        : 'stake';

    const blockchainPrivateAdapter: Web3Private = Injector.web3Private;
    return from(
      blockchainPrivateAdapter.executeContractMethodWithOnHashResolve(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        depositMethod,
        [Web3Pure.toWei(usdcAmount)]
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
    const privateBlockchainAdapter: Web3Private = Injector.web3Private;
    return from(
      privateBlockchainAdapter.executeContractMethodWithOnHashResolve(
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
          return of(receipt.status);
        }
      }),
      tap(() => {
        const updatedDeposits = this.deposits.filter(deposit => deposit.tokenId !== tokenId);
        this._deposits$.next(updatedDeposits);
      })
    );
  }

  public collectRewards(tokenId: string): Observable<unknown> {
    const privateBlockchainAdapter: Web3Private = Injector.web3Private;
    return from(
      privateBlockchainAdapter.executeContractMethodWithOnHashResolve(
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
          const updatedDeposits = this._deposits$.getValue().map(deposit => {
            if (deposit.tokenId === tokenId) {
              return { ...deposit, rewardsToCollect: new BigNumber(0) };
            } else {
              return deposit;
            }
          });
          this._deposits$.next(updatedDeposits);

          return this.getStatistics().pipe(take(1));
        }
      })
    );
  }

  public getStartAndEndTime(): Observable<string[]> {
    const publicBlockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );

    return forkJoin([
      from(
        publicBlockchainAdapter.callContractMethod<string>(
          this.lpContractAddress,
          LP_PROVIDING_CONTRACT_ABI,
          'startTime'
        )
      ),
      from(
        publicBlockchainAdapter.callContractMethod<string>(
          this.lpContractAddress,
          LP_PROVIDING_CONTRACT_ABI,
          'endTime'
        )
      )
    ]).pipe(
      tap(([startTime, endTime]) => {
        const whitelistEndTimestamp = +startTime * 1000 + this.whitelistDuration * 1000;
        this.endDate = new Date(+endTime * 1000);
        this.isLpEneded = new Date().getTime() > +endTime * 1000;
        this.whitelistEndTime = new Date(whitelistEndTimestamp);
      })
    );
  }

  public transfer(tokenId: string, address: string): Observable<unknown> {
    const privateBlockchainAdapter: Web3Private = Injector.web3Private;
    return from(
      privateBlockchainAdapter.tryExecuteContractMethod(
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
      tap(() => {
        this.setDepositsLoading(true);

        const updatedDeposits = this.deposits.filter(deposit => deposit.tokenId !== tokenId);
        this._deposits$.next(updatedDeposits);
      })
    );
  }

  public checkDepositErrors(
    brbcAmount: BigNumber,
    usdcAmount: BigNumber,
    usdcBalance: BigNumber,
    brbcBalance: BigNumber
  ): LpFormError | null {
    const totalStaked = this._totalStaked$.getValue();

    if (this.isLpEneded) {
      return LpFormError.LP_ENDED;
    }

    if (this.poolSize - totalStaked < this.minEnterAmount) {
      return LpFormError.POOL_FULL;
    }

    if (brbcBalance && brbcAmount.gt(brbcBalance)) {
      return LpFormError.INSUFFICIENT_BALANCE_BRBC;
    }

    if (usdcBalance && usdcAmount.gt(usdcBalance)) {
      return LpFormError.INSUFFICIENT_BALANCE_USDC;
    }

    if (brbcAmount.gt(this.currentMaxLimit)) {
      return LpFormError.LIMIT_GT_MAX;
    }

    if (brbcAmount.lt(this.minEnterAmount)) {
      return LpFormError.LIMIT_LT_MIN;
    }

    if (!brbcAmount.isFinite()) {
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
    this.setDepositType(depositType);
    this.router.navigate(['liquidity-providing', 'deposit']);
  }

  public setDepositType(depositType: DepositType): void {
    this.zone.run(() => {
      this._depositType$.next(depositType);
    });
  }

  public async switchNetwork(): Promise<boolean> {
    return await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }

  public getLpRewardsHistory(): Observable<LpRewardParsed[]> {
    return this.volumeApiService.fetchLpRewards().pipe(
      map(rewards => this.parseRewards(rewards)),
      tap(rewards => this._rewardsHistory$.next(rewards))
    );
  }

  private getTotalRewards(): Observable<BigNumber> {
    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
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
    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
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

  public getUserTotalStaked(): Observable<BigNumber> {
    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'viewUSDCAmountOf',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map(response => Web3Pure.fromWei(response)),
      tap(async userTotalStakedUsdc => {
        const brbcUsdcPrice = await this.tokensService.getAndUpdateTokenPrice({
          address: this.brbcAddress,
          blockchain: this.blockchain
        });
        const userTotalStakedBrbc = userTotalStakedUsdc.multipliedBy(1 / DEPOSIT_RATIO);
        const balance = userTotalStakedUsdc.plus(userTotalStakedBrbc.multipliedBy(brbcUsdcPrice));
        this.zone.run(() => {
          this._userTotalStaked$.next(Number(userTotalStakedBrbc.toFixed(2)));
        });
        this._balance$.next(balance);
      })
    );
  }

  public resetStatistics(): void {
    this._balance$.next(undefined);
    this._totalCollectedRewards$.next(undefined);
    this._rewardsToCollect$.next(undefined);
    this._userTotalStaked$.next(undefined);
  }

  private getApr(): Observable<string> {
    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);
    return from(
      blockchainAdapter.callContractMethod<string>(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'apr'
      )
    ).pipe(tap(apr => this._apr$.next(parseWeb3Percent(apr))));
  }

  private getTotalStaked(): Observable<BigNumber> {
    return from(
      this.blockchainAdapter.callContractMethod<BigNumber>(
        this.lpContractAddress,
        LP_PROVIDING_CONTRACT_ABI,
        'poolBRBC'
      )
    ).pipe(
      map(response => Web3Pure.fromWei(response)),
      tap(totalStaked => {
        this.isPoolFull = this.checkIsPoolFull(totalStaked.toNumber());
        this._totalStaked$.next(totalStaked.toNumber());
      })
    );
  }

  private checkIsPoolFull(totalStaked: number): boolean {
    return this.poolSize - totalStaked < this.minEnterAmount;
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

  private parseRewards(rewards: LpReward[]): LpRewardParsed[] {
    return rewards.map(reward => ({
      date: new Date(reward.created_at),
      txHash: reward.hash.toLocaleLowerCase(),
      scannerLink: this.scannerLinkPipe.transform(
        reward.hash,
        this.blockchain,
        ADDRESS_TYPE.TRANSACTION
      ),
      rewards: reward.amount,
      balance: 10
    }));
  }
}
