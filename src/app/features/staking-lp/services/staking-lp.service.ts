import { Injectable, NgZone } from '@angular/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { AuthService } from '@app/core/services/auth/auth.service';
import { UserInterface } from '@app/core/services/auth/models/user.interface';
import { VolumeApiService } from '@app/core/services/backend/volume-api/volume-api.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { STAKING_TOKENS } from '@app/features/staking/constants/STAKING_TOKENS';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  retry,
  switchMap,
  take,
  tap
} from 'rxjs/operators';
import { AbiItem } from 'web3-utils';
import { TradeVolumeByPeriod } from '@app/core/services/backend/volume-api/models/trade-volume-by-period';
import { TtvFilters } from '../models/ttv-filters.enum';
import { HttpClient } from '@angular/common/http';
import { STAKING_CONTRACTS } from '../constants/STAKING_CONTRACTS';
import { LP_CONTRACTS } from '../constants/LP_CONTRACTS';
import { parseWeb3Percent } from '@app/shared/utils/utils';
import { transitTokens } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/transit-tokens';
import { BLOCKCHAIN_NAME, Web3Pure } from 'rubic-sdk';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';

interface RoundContract {
  address: string;
  abi: AbiItem[];
  active?: boolean;
}

@Injectable()
export class StakingLpService {
  private readonly stakingContracts: RoundContract[] = STAKING_CONTRACTS;

  private readonly lpContracts: RoundContract[] = LP_CONTRACTS;

  get activeStakingContract(): RoundContract {
    return this.stakingContracts.find(contract => contract.active);
  }

  get activeLpContract(): RoundContract {
    return this.lpContracts.find(contract => contract.active);
  }

  private readonly user$ = this.authService.getCurrentUser().pipe(
    filter<UserInterface>(user => Boolean(user?.address)),
    distinctUntilChanged((a, b) => a?.address === b?.address)
  );

  private get userAddress(): string {
    return this.authService.user?.address;
  }

  private readonly _stakingBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly stakingBalance$ = this._stakingBalance$.asObservable();

  private readonly _lpBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly lpBalance$ = this._lpBalance$.asObservable();

  private readonly _totalBalanceInUsdc$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly totalBalanceInUsdc$ = this._totalBalanceInUsdc$.asObservable();

  private readonly _stakingRewards$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly stakingRewards$ = this._stakingRewards$.asObservable();

  private readonly _lpRewards$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly lpRewards$ = this._lpRewards$.asObservable();

  private readonly _totalRewardsInUsdc$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly totalRewardsInUsdc$ = this._totalRewardsInUsdc$.asObservable();

  private readonly _balanceAndRewardsLoading$ = new BehaviorSubject<boolean>(false);

  public readonly balanceAndRewardsLoading$ = this._balanceAndRewardsLoading$.asObservable();

  private readonly _tvlAndTtvLoading$ = new BehaviorSubject<boolean>(false);

  public readonly tvlAndTtvLoading$ = this._tvlAndTtvLoading$.asObservable();

  private readonly _stakingBalanceByRound$ = new BehaviorSubject<{
    roundOne: BigNumber;
    roundTwo: BigNumber;
  }>({
    roundOne: undefined,
    roundTwo: undefined
  });

  public readonly stakingBalanceByRound$ = this._stakingBalanceByRound$.asObservable();

  private readonly stakingToken = STAKING_TOKENS[0];

  private stakingTokenUsdPrice = this.tokensService.tokens?.find(
    token =>
      token.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      token.symbol === this.stakingToken.symbol
  ).price;

  private readonly _lpAprByRound$ = new BehaviorSubject<{ roundOne: string }>({
    roundOne: undefined
  });

  public readonly lpAprByRound$ = this._lpAprByRound$.asObservable();

  private readonly _lpBalanceByRound$ = new BehaviorSubject<{ roundOne: BigNumber }>({
    roundOne: undefined
  });

  public readonly lpBalanceByRound$ = this._lpBalanceByRound$.asObservable();

  private readonly _tvlStaking$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly tvlStaking$ = this._tvlStaking$.asObservable();

  private readonly _tvlMultichain$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly tvlMultichain$ = this._tvlMultichain$.asObservable();

  private readonly _tvlTotal$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly tvlTotal$ = this._tvlTotal$.asObservable();

  private readonly _ttv$ = new BehaviorSubject<TradeVolumeByPeriod>({
    totalValue: undefined,
    totalValueByHalfYear: undefined,
    totalValueBymonth: undefined,
    totalValueByday: undefined
  });

  public readonly ttv$ = this._ttv$.asObservable();

  private readonly _lpRoundStart$ = new BehaviorSubject<Date>(undefined);

  public readonly lpRoundStart$ = this._lpRoundStart$.asObservable();

  private readonly _lpRoundStarted$ = new BehaviorSubject<boolean>(undefined);

  public readonly lpRoundStarted$ = this._lpRoundStarted$.asObservable();

  public get lpRoundStarted(): boolean {
    return this._lpRoundStarted$.getValue();
  }

  private readonly _lpRoundEnded$ = new BehaviorSubject<boolean>(undefined);

  public readonly lpRoundEnded$ = this._lpRoundEnded$.asObservable();

  public get lpRoundEnded(): boolean {
    return this._lpRoundEnded$.getValue();
  }

  constructor(
    private readonly volumeApiService: VolumeApiService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService,
    private readonly httpClient: HttpClient,
    private readonly zone: NgZone
  ) {
    this.getStakingTokenPrice();
  }

  public getTotalBalanceAndRewards(): Observable<BigNumber[]> {
    return this.user$.pipe(
      tap(() => this.toggleLoading('balanceAndRewards', true)),
      switchMap(user => {
        return forkJoin([this.getActiveStakingRoundBalance(user.address), this.getLpBalance()]);
      }),
      tap(([stakingBalance, lpBalance]) => {
        this.zone.run(() => {
          this._stakingBalance$.next(stakingBalance);

          this._lpBalance$.next(lpBalance);

          this._totalBalanceInUsdc$.next(
            stakingBalance.multipliedBy(this.stakingTokenUsdPrice).plus(lpBalance)
          );
        });
      }),
      switchMap(() => this.getTotalRewards())
    );
  }

  private getActiveStakingRoundBalance(userAddress: string): Observable<BigNumber> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod<string>(
        this.activeStakingContract.address,
        this.activeStakingContract.abi,
        'userEnteredAmount',
        { methodArguments: [userAddress] }
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map((balance: BigNumber) => Web3Pure.fromWei(balance))
    );
  }

  private getLpBalance(): Observable<BigNumber> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
        this.activeLpContract.address,
        this.activeLpContract.abi,
        'viewUSDCAmountOf',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map((balance: string) =>
        Web3Pure.fromWei(balance, transitTokens[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].decimals)
      )
    );
  }

  private getTotalRewards(): Observable<BigNumber[]> {
    return forkJoin([this.getStakingRewards(), this.getLpRewards()]).pipe(
      tap(([stakingRewards, lpRewards]) => {
        this.zone.run(() => {
          this._stakingRewards$.next(stakingRewards);

          this._lpRewards$.next(lpRewards);

          this._totalRewardsInUsdc$.next(
            stakingRewards.multipliedBy(this.stakingTokenUsdPrice).plus(lpRewards)
          );
        });
      })
    );
  }

  private getStakingRewards(): Observable<BigNumber> {
    const usersDeposit = this._stakingBalance$.getValue();
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
        this.activeStakingContract.address,
        this.activeStakingContract.abi,
        'canReceive',
        { methodArguments: [Web3Pure.toWei(usersDeposit)] }
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map((canReceive: BigNumber) => {
        return Web3Pure.fromWei(canReceive).minus(usersDeposit);
      })
    );
  }

  private getLpRewards(): Observable<BigNumber> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
        this.activeLpContract.address,
        this.activeLpContract.abi,
        'viewRewardsTotal',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map((rewards: BigNumber) => {
        const bscUSDCToken = transitTokens[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
        return Web3Pure.fromWei(rewards, bscUSDCToken.decimals);
      })
    );
  }

  public resetTotalBalanceAndRewards(): void {
    this.zone.run(() => {
      this._lpBalance$.next(undefined);
      this._stakingBalance$.next(undefined);
      this._stakingRewards$.next(undefined);
      this._lpRewards$.next(undefined);
      this._totalBalanceInUsdc$.next(undefined);
      this._totalRewardsInUsdc$.next(undefined);
    });
  }

  public resetStakingBalances(): void {
    this.zone.run(() => {
      this._stakingBalanceByRound$.next({ roundOne: undefined, roundTwo: undefined });
    });
  }

  public resetLpBalances(): void {
    this.zone.run(() => {
      this._lpBalanceByRound$.next({ roundOne: undefined });
    });
  }

  public toggleLoading(dataType: 'balanceAndRewards' | 'tvlAndTtv', value: boolean): void {
    if (dataType === 'balanceAndRewards') {
      this.zone.run(() => {
        this._balanceAndRewardsLoading$.next(value);
      });
    }

    if (dataType === 'tvlAndTtv') {
      this.zone.run(() => {
        this._tvlAndTtvLoading$.next(value);
      });
    }
  }

  public getStakingBalanceByRound(): Observable<BigNumber[]> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    const balanceRequests = (userAddress: string) =>
      this.stakingContracts.map(contract => {
        return from(
          blockchainAdapter.callContractMethod(
            contract.address,
            contract.abi,
            'userEnteredAmount',
            { methodArguments: [userAddress] }
          )
        ).pipe(
          catchError((error: unknown) => {
            this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
            return EMPTY;
          }),
          map((balance: string) => Web3Pure.fromWei(balance))
        );
      });

    return this.user$.pipe(
      take(1),
      switchMap(user => forkJoin(balanceRequests(user.address))),
      tap(balances => {
        const [roundOne, roundTwo] = balances;
        this.zone.run(() => {
          this._stakingBalanceByRound$.next({ roundOne, roundTwo });
        });
      })
    );
  }

  private checkIsLpRoundStartedOrEnded(): Observable<boolean> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return forkJoin([
      from(
        blockchainAdapter.callContractMethod(
          this.activeLpContract.address,
          this.activeLpContract.abi,
          'startTime'
        )
      ),
      from(
        blockchainAdapter.callContractMethod(
          this.activeLpContract.address,
          this.activeLpContract.abi,
          'endTime'
        )
      )
    ]).pipe(
      map(([startTime, endTime]) => {
        const isStarted = new Date().getTime() > +startTime * 1000;
        const isEnded = new Date().getTime() > +endTime * 1000;

        this.zone.run(() => {
          this._lpRoundStart$.next(new Date(+startTime * 1000));
          this._lpRoundStarted$.next(isStarted);
          this._lpRoundEnded$.next(isEnded);
        });

        return isStarted;
      })
    );
  }

  public getLpBalanceByRound(): Observable<BigNumber[]> {
    const balanceRequests$ = (userAddress: string): Array<Promise<string>> => {
      return this.lpContracts.map(contract => {
        const publicAdapter = Injector.web3PublicService.getWeb3Public(
          BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        );
        return publicAdapter.callContractMethod(
          contract.address,
          contract.abi,
          'viewUSDCAmountOf',
          { methodArguments: [userAddress] }
        );
      });
    };

    return this.checkIsLpRoundStartedOrEnded().pipe(
      switchMap(isLpStarted => {
        if (isLpStarted) {
          return this.user$.pipe(
            take(1),
            switchMap(user => forkJoin(balanceRequests$(user.address))),
            map(lpBalanceByRound => lpBalanceByRound.map(balance => Web3Pure.fromWei(balance))),
            tap(lpBalanceByRound => {
              const [roundOneBalance] = lpBalanceByRound;
              this.zone.run(() => {
                this._lpBalanceByRound$.next({ roundOne: roundOneBalance });
              });
            })
          );
        } else {
          return EMPTY;
        }
      })
    );
  }

  public getLpAprByRound(): Observable<number[]> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    const aprRequests$ = this.lpContracts.map(contract =>
      blockchainAdapter.callContractMethod(contract.address, contract.abi, 'apr')
    );

    return forkJoin(aprRequests$).pipe(
      map(aprByRound => aprByRound.map(parseWeb3Percent)),
      tap(aprByRound => {
        const [roundOneApr] = aprByRound;
        this.zone.run(() => {
          this._lpAprByRound$.next({ roundOne: roundOneApr.toFixed(0) });
        });
      })
    );
  }

  public getTtv(): Observable<TradeVolumeByPeriod> {
    return this.volumeApiService.fetchVolumesByPeriod().pipe(
      catchError(() => {
        return EMPTY;
      }),
      tap(response => {
        this.zone.run(() => {
          this._ttv$.next(response);
        });
      })
    );
  }

  public getTtvByPeriod(period: TtvFilters): number {
    const ttv = this._ttv$.getValue();

    switch (period) {
      case TtvFilters.ALL_TIME:
        return ttv.totalValue;
      case TtvFilters.ONE_DAY:
        return ttv.totalValueByday;
      case TtvFilters.ONE_MONTH:
        return ttv.totalValueBymonth;
      case TtvFilters.SIX_MONTH:
        return ttv.totalValueByHalfYear;
      default:
        return undefined;
    }
  }

  public getTvlMultichain(): Observable<BigNumber> {
    this.toggleLoading('tvlAndTtv', true);

    const defiLamaTvlApiUrl = 'https://api.llama.fi/tvl/rubic';
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );

    return this.httpClient.get<number>(defiLamaTvlApiUrl).pipe(
      switchMap(tvlMultichain => {
        return forkJoin([
          from(
            blockchainAdapter.callContractMethod(
              this.activeLpContract.address,
              this.activeLpContract.abi,
              'poolUSDC'
            )
          ),
          of(tvlMultichain),
          from(
            this.tokensService.getAndUpdateTokenPrice(
              {
                address: this.stakingToken.address,
                blockchain: this.stakingToken.blockchain
              },
              true
            )
          )
        ]);
      }),
      map(([lpPoolBalance, tvlMultichain, stakingTokenUsdPrice]: [string, number, number]) => {
        const lpPoolBalanceInTokens = Web3Pure.fromWei(lpPoolBalance);
        const tvl = lpPoolBalanceInTokens
          .plus(lpPoolBalanceInTokens.multipliedBy(stakingTokenUsdPrice))
          .plus(tvlMultichain);
        return tvl;
      }),
      tap(tvl => {
        this.zone.run(() => {
          this._tvlMultichain$.next(tvl);
        });
      })
    );
  }

  public getTvlStaking(): Observable<BigNumber> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    );
    return from(
      blockchainAdapter.callContractMethod(
        this.activeStakingContract.address,
        this.activeStakingContract.abi,
        'totalRBCEntered'
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map((totalRbcEntered: string) => {
        const totalRbcEnteredInTokens = Web3Pure.fromWei(totalRbcEntered);
        return totalRbcEnteredInTokens.multipliedBy(this.stakingTokenUsdPrice);
      }),
      tap(tvlStaking => {
        this.zone.run(() => {
          this._tvlStaking$.next(tvlStaking);
        });
      })
    );
  }

  public getTotalTvl(): void {
    const tvlStaking = this._tvlStaking$.getValue();
    const tvlMultichain = this._tvlMultichain$.getValue();

    this.zone.run(() => {
      this._tvlTotal$.next(tvlMultichain.plus(tvlStaking));
    });
  }

  public getStakingTokenPrice(): void {
    from(
      this.tokensService.getAndUpdateTokenPrice(
        {
          address: this.stakingToken.address,
          blockchain: this.stakingToken.blockchain
        },
        true
      )
    )
      .pipe(retry(3))
      .subscribe(price => {
        if (!Boolean(this.stakingTokenUsdPrice)) {
          this.stakingTokenUsdPrice = price;
        }
      });
  }
}
