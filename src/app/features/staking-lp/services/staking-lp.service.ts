import { Injectable } from '@angular/core';
import { STAKING_CONTRACT_ABI_ROUND_ONE } from '@app/core/constants/staking/STAKING_CONTRACT_ABI_ROUND_ONE';
import { STAKING_CONTRACT_ABI_ROUND_TWO } from '@app/core/constants/staking/STAKING_CONTRACT_ABI_ROUND_TWO';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { AuthService } from '@app/core/services/auth/auth.service';
import { UserInterface } from '@app/core/services/auth/models/user.interface';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { STAKING_TOKENS } from '@app/features/staking/constants/STAKING_TOKENS';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';
import { AbiItem } from 'web3-utils';

@Injectable()
export class StakingLpService {
  private readonly stakingContracts: { address: string; abi: AbiItem[]; active?: boolean }[] = [
    {
      address: ENVIRONMENT.staking.roundOneContractAddress,
      abi: STAKING_CONTRACT_ABI_ROUND_ONE
    },
    {
      address: ENVIRONMENT.staking.roundTwoContractAddress,
      abi: STAKING_CONTRACT_ABI_ROUND_TWO,
      active: true
    }
  ];

  private readonly lpContracts: { address: string; abi: AbiItem[]; active?: boolean }[] = [];

  get activeStakingContract(): { address: string; abi: AbiItem[]; active?: boolean } {
    return this.stakingContracts.find(contract => contract.active);
  }

  private readonly userAddress$ = this.authService.getCurrentUser().pipe(
    filter<UserInterface>(user => Boolean(user?.address)),
    distinctUntilChanged((a, b) => a?.address === b?.address)
  );

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

  private readonly _statisticsLoading$ = new BehaviorSubject<boolean>(false);

  public readonly statisticsLoading$ = this._statisticsLoading$.asObservable();

  private readonly _stakingBalanceByRound$ = new BehaviorSubject<{
    roundOne: BigNumber;
    roundTwo: BigNumber;
  }>({
    roundOne: undefined,
    roundTwo: undefined
  });

  public readonly stakingBalanceByRound$ = this._stakingBalanceByRound$.asObservable();

  private readonly stakingToken = STAKING_TOKENS[0];

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService
  ) {}

  public getTotalBalanceAndRewards(): Observable<BigNumber[]> {
    return this.userAddress$.pipe(
      tap(() => this.toggleStatisticsLoading(true)),
      switchMap(user => {
        return forkJoin([
          this.getActiveStakingRoundBalance(user.address),
          this.getLpBalance(user.address)
        ]);
      }),
      withLatestFrom(
        from(
          this.tokensService.getAndUpdateTokenPrice({
            address: this.stakingToken.address,
            blockchain: this.stakingToken.blockchain
          })
        )
      ),
      tap(([[stakingBalance, lpBalance], stakingTokenUsdPrice]) => {
        this._stakingBalance$.next(stakingBalance);

        this._lpBalance$.next(lpBalance);

        this._totalBalanceInUsdc$.next(
          stakingBalance.multipliedBy(stakingTokenUsdPrice).plus(lpBalance)
        );
      }),
      switchMap(([_, stakingTokenUsdPrice]) => this.getTotalRewards(stakingTokenUsdPrice)),
      finalize(() => this.toggleStatisticsLoading(false))
    );
  }

  private getActiveStakingRoundBalance(userAddress: string): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod<string>(
        this.activeStakingContract.address,
        this.activeStakingContract.abi,
        'userEnteredAmount',
        { methodArguments: [userAddress] }
      )
    ).pipe(
      catchError((error: unknown) => {
        console.log(error);
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(undefined);
      }),
      map(balance => Web3Pure.fromWei(balance))
    );
  }

  private getLpBalance(userAddress?: string): Observable<BigNumber> {
    console.log(userAddress);
    return of(new BigNumber(0));
  }

  private getTotalRewards(stakingTokenUsdPrice: number): Observable<BigNumber[]> {
    return forkJoin([this.getStakingRewards(), this.getLpRewards()]).pipe(
      tap(([stakingRewards, lpRewards]) => {
        this._stakingRewards$.next(stakingRewards);

        this._lpRewards$.next(lpRewards);

        this._totalRewardsInUsdc$.next(
          stakingRewards.multipliedBy(stakingTokenUsdPrice).plus(lpRewards)
        );
      })
    );
  }

  private getStakingRewards(): Observable<BigNumber> {
    const usersDeposit = this._stakingBalance$.getValue();
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.activeStakingContract.address,
        this.activeStakingContract.abi,
        'canReceive',
        { methodArguments: [Web3Pure.toWei(usersDeposit)] }
      )
    ).pipe(
      catchError((error: unknown) => {
        console.log(error);
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map(canReceive => {
        return Web3Pure.fromWei(canReceive).minus(usersDeposit);
      })
    );
  }

  private getLpRewards(): Observable<BigNumber> {
    return of(new BigNumber(0));
  }

  public toggleStatisticsLoading(value: boolean): void {
    this._statisticsLoading$.next(value);
  }

  public getStakingBalanceByRound(): Observable<BigNumber[]> {
    const balanceRequests = (userAddress: string) =>
      this.stakingContracts.map(contract => {
        return from(
          this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
            contract.address,
            contract.abi,
            'userEnteredAmount',
            { methodArguments: [userAddress] }
          )
        ).pipe(
          catchError((error: unknown) => {
            this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
            return of(undefined);
          }),
          map(balance => Web3Pure.fromWei(balance))
        );
      });

    return this.userAddress$.pipe(
      switchMap(user => forkJoin(balanceRequests(user.address))),
      tap(balances => {
        const [roundOne, roundTwo] = balances;
        this._stakingBalanceByRound$.next({ roundOne, roundTwo });
      })
    );
  }

  public getLpBalanceAndAprByRound(): void {}
}
