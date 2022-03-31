import { Injectable } from '@angular/core';
import { STAKING_CONTRACT_ABI_ROUND_ONE } from '@app/core/constants/staking/STAKING_CONTRACT_ABI_ROUND_ONE';
import { STAKING_CONTRACT_ABI_ROUND_TWO } from '@app/core/constants/staking/STAKING_CONTRACT_ABI_ROUND_TWO';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { AuthService } from '@app/core/services/auth/auth.service';
import { UserInterface } from '@app/core/services/auth/models/user.interface';
import { VolumeApiService } from '@app/core/services/backend/volume-api/volume-api.service';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { transitTokens } from '@app/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/constants/transit-tokens';
import { STAKING_TOKENS } from '@app/features/staking/constants/STAKING_TOKENS';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';
import { AbiItem } from 'web3-utils';
import { BlockchainsInfo } from '@app/core/services/blockchain/blockchain-info';
import { PDA_DELEGATE } from '@app/features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';

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

  private readonly crosschainContracts = ENVIRONMENT.crossChain.contractAddresses;

  get activeStakingContract(): { address: string; abi: AbiItem[]; active?: boolean } {
    return this.stakingContracts.find(contract => contract.active);
  }

  get activeLpContract(): { address: string; abi: AbiItem[]; active?: boolean } {
    return this.lpContracts.find(contract => contract.active);
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

  private readonly _stakingTokenUsdPrice$ = new BehaviorSubject<number>(undefined);

  private readonly _tvlStaking$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly tvlStaking$ = this._tvlStaking$.asObservable();

  private readonly _tvlMultichain$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly tvlMultichain$ = this._tvlMultichain$.asObservable();

  // private readonly _ttv$ = new BehaviorSubject<TradeVolume>(undefined);

  // public readonly ttv$ = this._ttv$.asObservable();

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly volumeApiService: VolumeApiService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService
  ) {}

  public getTotalBalanceAndRewards(): Observable<BigNumber[]> {
    return this.userAddress$.pipe(
      tap(() => this.toggleLoading('balanceAndRewards', true)),
      take(1),
      switchMap(user => {
        return forkJoin([this.getActiveStakingRoundBalance(user.address), this.getLpBalance()]);
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
        this._stakingTokenUsdPrice$.next(stakingTokenUsdPrice);

        this._stakingBalance$.next(stakingBalance);

        this._lpBalance$.next(lpBalance);

        this._totalBalanceInUsdc$.next(
          stakingBalance.multipliedBy(stakingTokenUsdPrice).plus(lpBalance)
        );
      }),
      switchMap(([_, stakingTokenUsdPrice]) => this.getTotalRewards(stakingTokenUsdPrice))
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

  private getLpBalance(): Observable<BigNumber> {
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

  public toggleLoading(dataType: 'balanceAndRewards' | 'tvlAndTtv', value: boolean): void {
    if (dataType === 'balanceAndRewards') {
      this._balanceAndRewardsLoading$.next(value);
    }

    if (dataType === 'tvlAndTtv') {
      this._tvlAndTtvLoading$.next(value);
    }
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

  public getTtv(): void {}

  public getTvlMultichain(): Observable<BigNumber> {
    const crosschainContracts = Object.entries(this.crosschainContracts) as [
      SupportedCrossChainBlockchain,
      string
    ][];

    return forkJoin(
      crosschainContracts.map(async contract => {
        const [blockchain, address] = contract;
        const transitToken = transitTokens[blockchain];

        const poolBalance = await this.web3PublicService[blockchain].getTokenBalance(
          BlockchainsInfo.getBlockchainType(blockchain) === 'solana' ? PDA_DELEGATE : address,
          transitToken.address
        );

        return Web3Pure.fromWei(poolBalance, transitToken.decimals);
      })
    ).pipe(
      map(poolBalances => {
        return poolBalances.reduce((prev, curr) => {
          return prev.plus(curr);
        }, new BigNumber(0));
      }),
      tap(tvlMultichain => {
        this._tvlMultichain$.next(tvlMultichain);
      })
    );
  }

  public getTvlStaking(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.activeStakingContract.address,
        this.activeStakingContract.abi,
        'totalRBCEntered'
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map(totalRbcEntered => {
        const totalRbcEnteredInTokens = Web3Pure.fromWei(totalRbcEntered);
        const stakingTokenUsdPrice = this._stakingTokenUsdPrice$.getValue();

        return totalRbcEnteredInTokens.multipliedBy(stakingTokenUsdPrice);
      }),
      tap(tvlStaking => {
        this._tvlStaking$.next(tvlStaking);
      })
    );
  }
}
