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
import { BehaviorSubject, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap
} from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';
import { AbiItem } from 'web3-utils';
import { BlockchainsInfo } from '@app/core/services/blockchain/blockchain-info';
import { PDA_DELEGATE } from '@app/features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';
import { LP_PROVIDING_CONTRACT_ABI } from '@app/features/liquidity-providing/constants/LP_PROVIDING_CONTRACT_ABI';

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

  private readonly lpContracts: { address: string; abi: AbiItem[]; active?: boolean }[] = [
    {
      address: ENVIRONMENT.lpProviding.contractAddress,
      abi: LP_PROVIDING_CONTRACT_ABI,
      active: true
    }
  ];

  private readonly crosschainContracts = ENVIRONMENT.crossChain.contractAddresses;

  get activeStakingContract(): { address: string; abi: AbiItem[]; active?: boolean } {
    return this.stakingContracts.find(contract => contract.active);
  }

  get activeLpContract(): { address: string; abi: AbiItem[]; active?: boolean } {
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

  private readonly _stakingTokenUsdPrice$ = new BehaviorSubject<number>(undefined);

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

  // private readonly _ttv$ = new BehaviorSubject<TradeVolume>(undefined);

  // public readonly ttv$ = this._ttv$.asObservable();

  private readonly _lpRoundStarted$ = new BehaviorSubject<boolean>(undefined);

  public readonly lpRoundStarted$ = this._lpRoundStarted$.asObservable();

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly volumeApiService: VolumeApiService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService
  ) {
    this.tokensService
      .getAndUpdateTokenPrice({
        address: this.stakingToken.address,
        blockchain: this.stakingToken.blockchain
      })
      .then(price => this._stakingTokenUsdPrice$.next(price));
  }

  public getTotalBalanceAndRewards(): Observable<BigNumber[]> {
    return this.user$.pipe(
      tap(() => this.toggleLoading('balanceAndRewards', true)),
      switchMap(user => {
        return forkJoin([this.getActiveStakingRoundBalance(user.address), this.getLpBalance()]);
      }),
      tap(([stakingBalance, lpBalance]) => {
        this._stakingBalance$.next(stakingBalance);

        this._lpBalance$.next(lpBalance);

        this._totalBalanceInUsdc$.next(
          stakingBalance.multipliedBy(this._stakingTokenUsdPrice$.getValue()).plus(lpBalance)
        );
      }),
      switchMap(() => this.getTotalRewards())
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
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map(balance => Web3Pure.fromWei(balance))
    );
  }

  private getLpBalance(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.activeLpContract.address,
        this.activeLpContract.abi,
        'viewUSDCAmountOf',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map(balance =>
        Web3Pure.fromWei(balance, transitTokens[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].decimals)
      )
    );
  }

  private getTotalRewards(): Observable<BigNumber[]> {
    return forkJoin([this.getStakingRewards(), this.getLpRewards()]).pipe(
      tap(([stakingRewards, lpRewards]) => {
        this._stakingRewards$.next(stakingRewards);

        this._lpRewards$.next(lpRewards);

        this._totalRewardsInUsdc$.next(
          stakingRewards.multipliedBy(this._stakingTokenUsdPrice$.getValue()).plus(lpRewards)
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
        this.errorService.catchAnyError(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      map(canReceive => {
        return Web3Pure.fromWei(canReceive).minus(usersDeposit);
      })
    );
  }

  private getLpRewards(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.activeLpContract.address,
        this.activeLpContract.abi,
        'viewRewardsTotal',
        { methodArguments: [this.userAddress] }
      )
    ).pipe(
      map(rewards => {
        const bscUSDCToken = transitTokens[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
        return Web3Pure.fromWei(rewards, bscUSDCToken.decimals);
      })
    );
  }

  public resetTotalBalanceAndRewards(): void {
    this._lpBalance$.next(undefined);

    this._stakingBalance$.next(undefined);

    this._stakingRewards$.next(undefined);

    this._lpRewards$.next(undefined);

    this._totalBalanceInUsdc$.next(undefined);

    this._totalRewardsInUsdc$.next(undefined);
  }

  public resetStakingBalances(): void {
    this._stakingBalanceByRound$.next({ roundOne: undefined, roundTwo: undefined });
  }

  public resetLpBalances(): void {
    this._lpBalanceByRound$.next({ roundOne: undefined });
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

    return this.user$.pipe(
      take(1),
      switchMap(user => forkJoin(balanceRequests(user.address))),
      tap(balances => {
        const [roundOne, roundTwo] = balances;
        this._stakingBalanceByRound$.next({ roundOne, roundTwo });
      })
    );
  }

  public checkIsLpRoundStarted(): Observable<boolean> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.activeLpContract.address,
        this.activeLpContract.abi,
        'startTime'
      )
    ).pipe(
      map(startTime => {
        const isStarted = Number(startTime) !== 0;
        this._lpRoundStarted$.next(isStarted);
        return isStarted;
      })
    );
  }

  public getLpBalanceAndAprByRound(): Observable<string[][]> {
    const balanceAndAprRequests = (userAddress: string) => {
      return this.lpContracts.map(contract => {
        return forkJoin([
          this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
            contract.address,
            contract.abi,
            'viewUSDCAmountOf',
            { methodArguments: [userAddress] }
          ),
          this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
            contract.address,
            contract.abi,
            'apr'
          )
        ]);
      });
    };

    return this.user$.pipe(
      take(1),
      switchMap(user => {
        return forkJoin([of(user), this.checkIsLpRoundStarted()]);
      }),
      switchMap(([user, isLpStarted]) => {
        if (isLpStarted) {
          return forkJoin(balanceAndAprRequests(user.address));
        } else {
          return EMPTY;
        }
      }),
      tap(response => {
        const [roundOne] = response;
        const [balance, apr] = roundOne;
        const bscUSDCToken = transitTokens[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

        this._lpAprByRound$.next({ roundOne: apr });

        this._lpBalanceByRound$.next({
          roundOne: Web3Pure.fromWei(balance, bscUSDCToken.decimals)
        });
      })
    );
  }

  public getTtv(): void {}

  public getTvlMultichain(): Observable<BigNumber> {
    this.toggleLoading('tvlAndTtv', true);

    const crosschainContracts = Object.entries(this.crosschainContracts) as [
      SupportedCrossChainBlockchain,
      string
    ][];

    return forkJoin(
      crosschainContracts.map(async contract => {
        const [blockchain, address] = contract;
        const transitToken = transitTokens[blockchain];

        try {
          const poolBalance = await this.web3PublicService[blockchain].getTokenBalance(
            BlockchainsInfo.getBlockchainType(blockchain) === 'solana' ? PDA_DELEGATE : address,
            transitToken.address
          );

          return Web3Pure.fromWei(poolBalance, transitToken.decimals);
        } catch (error) {
          return new BigNumber(0);
        }
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

  public getTotalTvl(): void {
    const tvlStaking = this._tvlStaking$.getValue();
    const tvlMultichain = this._tvlMultichain$.getValue();

    this._tvlTotal$.next(tvlMultichain.plus(tvlStaking));
  }
}
