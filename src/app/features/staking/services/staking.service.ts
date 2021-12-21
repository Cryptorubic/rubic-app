import { Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, from, merge, Observable, of } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';

import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3PublicService } from '@app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { Web3Public } from '@app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { STAKING_CONTRACT_ABI } from '../constants/XBRBC_CONTRACT_ABI';
import { Web3PrivateService } from '@app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import { StakingApiService } from '@features/staking/services/staking-api.service';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapModalComponent } from '@features/staking/components/swap-modal/swap-modal.component';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicError } from '@core/errors/models/RubicError';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { TransactionReceipt } from 'web3-eth';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';

@Injectable()
export class StakingService {
  private walletAddress: string;

  private readonly stakingContractAddress = this.testingModeService.isTestingMode.getValue()
    ? '0xc7FC65d50AfFBF2f32236eDc5217A916614e1F9d' //testnet xBRBC
    : '0x0d0Ed1E7994a3926644cac9b296B3745315700ff'; // mainnet xBRBC

  private bridgeContractAddress: string;

  public readonly needLogin$ = this.authService.getCurrentUser().pipe(map(user => !user?.address));

  private readonly _amountWithRewards$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly amountWithRewards$ = this._amountWithRewards$.asObservable();

  private readonly _apr$ = new BehaviorSubject<number>(0);

  public readonly apr$ = this._apr$.asObservable();

  private readonly _refillTime$ = new BehaviorSubject<string>(undefined);

  public readonly refillTime$ = this._refillTime$.asObservable();

  private readonly _userEnteredAmount$ = new BehaviorSubject<number>(0);

  public readonly userEnteredAmount$ = this._userEnteredAmount$.asObservable();

  private readonly _totalRBCEntered$ = new BehaviorSubject<number>(0);

  public readonly totalRBCEntered$ = this._totalRBCEntered$.asObservable();

  public readonly stakingProgress$ = combineLatest([
    this._totalRBCEntered$,
    this._userEnteredAmount$
  ]).pipe(map(([totalRbcEntered, userEnteredAmount]) => ({ totalRbcEntered, userEnteredAmount })));

  public readonly stakingProgressLoading$ = new BehaviorSubject<boolean>(true);

  public readonly stakingStatisticsLoading$ = new BehaviorSubject<boolean>(true);

  private readonly _stakingTokenBalance$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly stakingTokenBalance$ = this._stakingTokenBalance$.asObservable();

  private readonly _earnedRewards$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private readonly _selectedToken$ = new BehaviorSubject<MinimalToken>(undefined);

  public readonly selectedToken$ = this._selectedToken$.asObservable();

  public readonly selectedTokenBalance$ = this.needLogin$.pipe(
    switchMap(needLogin => {
      if (needLogin) {
        return of(new BigNumber(0));
      }
      console.log(this.selectedToken);
      return this.getSelectedTokenBalance(this.selectedToken.address);
    })
  );

  get selectedToken(): MinimalToken {
    return this._selectedToken$.getValue();
  }

  private readonly _usersTotalDeposit$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly earnedRewards$ = combineLatest([
    this._usersTotalDeposit$,
    this._amountWithRewards$
  ]).pipe(
    map(([usersDeposit, amountWithRewards]) => amountWithRewards.minus(usersDeposit)),
    tap(earnedRewards => this._earnedRewards$.next(earnedRewards))
  );

  public readonly dataReloading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly authService: AuthService,
    private readonly stakingApiService: StakingApiService,
    private readonly errorService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly testingModeService: UseTestingModeService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    forkJoin([this.getTotalRBCEntered(), this.getApr()]).subscribe(() => {
      this.stakingProgressLoading$.next(false);
    });

    this.authService
      .getCurrentUser()
      .pipe(
        filter(Boolean),
        tap(({ address }) => (this.walletAddress = address)),
        switchMap(() => {
          return forkJoin([
            this.getAmountWithRewards(),
            this.getStakingTokenBalance(),
            this.getUserEnteredAmount()
          ]);
        }),
        switchMap(([amountWithRewards]) => {
          return this.getEarnedRewards(amountWithRewards);
        })
      )
      .subscribe(() => this.stakingStatisticsLoading$.next(false));

    this.stakingApiService.getBridgeContractAddress().subscribe(address => {
      this.bridgeContractAddress = address;
    });
  }

  public setToken(token: MinimalToken): void {
    this._selectedToken$.next(token);
  }

  public enterStake(amount: BigNumber): Observable<TransactionReceipt | unknown> {
    const tokenBlockchain = this._selectedToken$.getValue().blockchain;
    const needSwap =
      tokenBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET &&
      tokenBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    const amountInWei = Number(Web3Public.toWei(amount, 18)).toLocaleString('fullwide', {
      useGrouping: false
    });

    if (needSwap) {
      return this.openSwapModal();
    } else {
      const enterStake$ = from(
        this.web3PrivateService.tryExecuteContractMethod(
          this.stakingContractAddress,
          STAKING_CONTRACT_ABI,
          'enter',
          [new BigNumber(amountInWei)]
        )
      );

      return enterStake$.pipe(
        catchError((err: unknown) => {
          console.error('enter stake error');
          this.errorService.catchAnyError(err as Error);
          return EMPTY;
        }),
        switchMap(() => {
          return forkJoin([
            this.reloadStakingStatistics(),
            this.reloadStakingProgress(),
            this.updateUsersDeposit(amountInWei)
          ]);
        })
      );
    }
  }

  public leaveStake(amount: BigNumber): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService.tryExecuteContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'leave',
        [Web3Public.toWei(amount, 18)]
      )
    );
  }

  public needApprove(amount: BigNumber): Observable<boolean> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].getAllowance(
        this.selectedToken.address,
        this.walletAddress,
        this.stakingContractAddress
      )
    ).pipe(map(allowance => amount.gt(Web3Public.fromWei(allowance, 18))));
  }

  public approveTokens(): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService.approveTokens(
        this.selectedToken.address,
        this.stakingContractAddress,
        'infinity'
      )
    ).pipe(
      tap(() =>
        this.notificationsService.show(
          this.translateService.instant('bridgePage.approveProgressMessage'),
          {
            label: this.translateService.instant('notifications.approveInProgress'),
            status: TuiNotification.Info,
            autoClose: false
          }
        )
      ),
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return of({} as TransactionReceipt);
      })
    );
  }

  private approve(): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService.approveTokens(
        this.selectedToken.address,
        this.stakingContractAddress,
        'infinity'
      )
    );
  }

  public getSelectedTokenBalance(tokenAddress: string): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].getTokenBalance(
        this.walletAddress,
        tokenAddress
      )
    ).pipe(map(balance => Web3Public.fromWei(balance, 18)));
  }

  public getStakingTokenBalance(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].getTokenBalance(
        this.walletAddress,
        this.stakingContractAddress
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber('0'));
      }),
      tap(balance => this._stakingTokenBalance$.next(Web3Public.fromWei(balance, 18)))
    );
  }

  private getAmountWithRewards(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'actualBalanceOf',
        {
          methodArguments: [this.walletAddress],
          from: this.walletAddress
        }
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map(actualBalance => Web3Public.fromWei(actualBalance, 18)),
      tap(actualBalance => this._amountWithRewards$.next(actualBalance))
    );
  }

  getEarnedRewards(amountWithRewards?: BigNumber): Observable<BigNumber> {
    return combineLatest([
      this.getUsersDeposit(),
      amountWithRewards ? of(amountWithRewards) : this._amountWithRewards$
    ]).pipe(
      map(() => {
        // const usersDepositInTokens = Web3Public.fromWei(usersDeposit, 18);
        // console.log(usersDepositInTokens.toNumber());
        // const earnedRewards = totalAmount.toNumber() - usersDepositInTokens.toNumber();
        // if (earnedRewards < 0) {
        //   return new BigNumber(0);
        // }
        return new BigNumber(0);
      }),
      tap(earnedRewards => this._earnedRewards$.next(earnedRewards))
    );
  }

  reloadStakingStatistics(): Observable<(number | BigNumber)[]> {
    return forkJoin([
      this.getStakingTokenBalance(),
      this.getAmountWithRewards(),
      this.getEarnedRewards(),
      this.getApr()
    ]);
  }

  private getUserEnteredAmount(): Observable<number> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'userEnteredAmount',
        {
          methodArguments: [this.walletAddress]
        }
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map(amount => Web3Public.fromWei(amount, 18).toNumber()),
      tap(userEnteredAmount => this._userEnteredAmount$.next(userEnteredAmount))
    );
  }

  public getTotalRBCEntered(): Observable<string> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'totalRBCEntered'
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return of('0');
      }),
      tap(totalRbcEntered =>
        this._totalRBCEntered$.next(Web3Public.fromWei(+totalRbcEntered, 18).toNumber())
      )
    );
  }

  public reloadStakingProgress(): Observable<string | number> {
    return merge(this.getTotalRBCEntered(), this.getUserEnteredAmount());
  }

  private getApr(): Observable<number> {
    return this.stakingApiService.getApr().pipe(tap(apr => this._apr$.next(apr)));
  }

  private getRefillTime(): Observable<string> {
    return this.stakingApiService
      .getRefillTime()
      .pipe(tap(refillTime => this._refillTime$.next(refillTime)));
  }

  public calculateLeaveReward(amount: BigNumber): Observable<BigNumber> {
    if (amount.isZero()) {
      return of(amount);
    }
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'canReceive',
        { methodArguments: [amount], from: this.walletAddress }
      )
    ).pipe(map(res => Web3Public.fromWei(res, 18)));
  }

  private getUsersDeposit(): Observable<number> {
    return this.stakingApiService
      .getUsersDeposit(this.walletAddress)
      .pipe(tap(deposit => this._usersTotalDeposit$.next(new BigNumber(deposit))));
  }

  private updateUsersDeposit(amount: string): Observable<number> {
    return this.stakingApiService
      .updateUsersDeposit({ walletAddress: this.walletAddress, amount })
      .pipe(switchMap(() => this.getUsersDeposit()));
  }

  private openSwapModal(): Observable<unknown> {
    return this.dialogService.open(new PolymorpheusComponent(SwapModalComponent, this.injector), {
      size: 'l'
    });
  }
}
