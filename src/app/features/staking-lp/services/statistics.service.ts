import { Injectable } from '@angular/core';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { BLOCKCHAIN_NAME, Web3Public, Web3Pure } from 'rubic-sdk';
import { BehaviorSubject, combineLatest, from, Observable, switchMap } from 'rxjs';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { STAKING_CONTRACTS } from '@features/staking-lp/constants/STAKING_CONTRACTS';
import { RoundContract } from '@features/staking-lp/models/round-contract';
import { CoingeckoApiService } from '@core/services/external-api/coingecko-api/coingecko-api.service';
import { STAKING_ROUND_THREE } from '@features/staking-lp/constants/STAKING_ROUND_THREE';

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

  private readonly TOTAL_SUPPLY = new BigNumber(124_000_000);

  private readonly NUMBER_OF_SECONDS_PER_WEEK = 604_800;

  public readonly rewardPerSecond$ = this.updateStatistics$.pipe(
    switchMap(() =>
      this.getCurrentEpochId().pipe(
        switchMap(currentEpochId => this.getCurrentEpochInfo(currentEpochId)),
        map(epochInfo =>
          Web3Pure.fromWei(epochInfo.rewardPerSecond).multipliedBy(this.NUMBER_OF_SECONDS_PER_WEEK)
        )
      )
    )
  );

  public readonly apr$ = this.updateStatistics$.pipe(
    switchMap(() =>
      this.rewardPerSecond$.pipe(
        map(value => value.multipliedBy(new BigNumber(52).dividedBy(this.TOTAL_SUPPLY)))
      )
    )
  );

  public readonly circRBCLocked$ = this.updateStatistics$.pipe(
    switchMap(() =>
      this.lockedRBC$.pipe(map(lockedRBCAmount => lockedRBCAmount.dividedBy(this.TOTAL_SUPPLY)))
    )
  );

  get activeStakingContract(): RoundContract {
    return STAKING_CONTRACTS.find(contract => contract.active);
  }

  constructor(private readonly coingeckoApiService: CoingeckoApiService) {}

  private static get blockchainAdapter(): Web3Public {
    return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
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

  private getCurrentEpochId(): Observable<number> {
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
