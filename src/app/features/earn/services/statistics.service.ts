import { Injectable } from '@angular/core';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { BLOCKCHAIN_NAME, Web3Public, Web3Pure } from 'rubic-sdk';
import { BehaviorSubject, combineLatest, from, Observable, switchMap, tap } from 'rxjs';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { CoingeckoApiService } from '@core/services/external-api/coingecko-api/coingecko-api.service';
import { STAKING_ROUND_THREE } from '@features/earn/constants/STAKING_ROUND_THREE';

interface EpochInfo {
  startTime: string;
  endTime: string;
  rewardPerSecond: string;
  totalPower: string;
  startBlock: string;
}

@Injectable()
export class StatisticsService {
  private readonly _updateStatistics$ = new BehaviorSubject<void>(null);

  public readonly updateStatistics$ = this._updateStatistics$.asObservable();

  private readonly _lockedRBC$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly lockedRBC$ = this._lockedRBC$.asObservable();

  public readonly lockedRBCInDollars$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.lockedRBC$, this.getRBCPrice()]).pipe(
        map(([lockedRbcAmount, rbcPrice]) => lockedRbcAmount.multipliedBy(rbcPrice))
      )
    )
  );

  private readonly _totalSupply$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  private readonly supply = new BigNumber(124_000_000);

  private readonly numberOfSecondsPerWeek = 604_800;

  private readonly numberOfWeekPerYear = 52;

  private readonly reward_multiplier = new BigNumber(10_000_000);

  public currentStakingApr = new BigNumber(0);

  private readonly _rewardPerSecond$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly rewardPerSecond$ = this.updateStatistics$.pipe(
    switchMap(() =>
      StatisticsService.getCurrentEpochId().pipe(
        switchMap(currentEpochId => this.getCurrentEpochInfo(currentEpochId)),
        map(epochInfo =>
          Web3Pure.fromWei(epochInfo.rewardPerSecond)
            .multipliedBy(this.numberOfSecondsPerWeek)
            .dividedBy(this.reward_multiplier)
        ),
        tap(rewardPerSecond => this._rewardPerSecond$.next(rewardPerSecond))
      )
    )
  );

  public readonly apr$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.rewardPerSecond$, this.getTotalSupply()]).pipe(
        map(([rewardPerSecond, totalSupply]) => {
          this.currentStakingApr = rewardPerSecond
            .multipliedBy(this.numberOfWeekPerYear)
            .dividedBy(totalSupply)
            .multipliedBy(100);

          return this.currentStakingApr;
        })
      )
    )
  );

  public readonly circRBCLocked$ = this.updateStatistics$.pipe(
    switchMap(() =>
      this.lockedRBC$.pipe(map(lockedRBCAmount => lockedRBCAmount.dividedBy(this.supply)))
    )
  );

  constructor(private readonly coingeckoApiService: CoingeckoApiService) {}

  private static get blockchainAdapter(): Web3Public {
    return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }

  public getTotalSupply(): Observable<BigNumber> {
    return from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'totalSupply'
      )
    ).pipe(
      map(value => {
        this._totalSupply$.next(Web3Pure.fromWei(value));
        return Web3Pure.fromWei(value);
      })
    );
  }

  public getLockedRBC(): void {
    from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'supply'
      )
    ).subscribe((value: string) => {
      this._lockedRBC$.next(Web3Pure.fromWei(value));
    });
  }

  public getCurrentEpochInfo(currentEpochId: number): Observable<EpochInfo> {
    return from(
      StatisticsService.blockchainAdapter.callContractMethod<EpochInfo>(
        STAKING_ROUND_THREE.REWARDS.address,
        STAKING_ROUND_THREE.REWARDS.abi,
        'epochInfo',
        { methodArguments: [currentEpochId] }
      ) as Promise<EpochInfo>
    );
  }

  private static getCurrentEpochId(): Observable<number> {
    return from(
      StatisticsService.blockchainAdapter.callContractMethod<number>(
        STAKING_ROUND_THREE.REWARDS.address,
        STAKING_ROUND_THREE.REWARDS.abi,
        'getCurrentEpochId'
      ) as Promise<number>
    );
  }

  public getRBCPrice(): Observable<number> {
    return this.coingeckoApiService.getCommonTokenPrice(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      '0x8e3bcc334657560253b83f08331d85267316e08a'
    );
  }

  public updateStatistics(): void {
    this._updateStatistics$.next();
  }
}
