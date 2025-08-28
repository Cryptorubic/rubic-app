import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, EvmWeb3Public, Injector, Web3Pure } from '@cryptorubic/sdk';
import { BehaviorSubject, combineLatest, from, switchMap } from 'rxjs';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { STAKING_ROUND_THREE } from '../constants/STAKING_ROUND_THREE';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';

@Injectable()
export class StatisticsService {
  private readonly _updateStatistics$ = new BehaviorSubject<void>(null);

  public readonly updateStatistics$ = this._updateStatistics$.asObservable();

  private readonly _lockedRBC$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly lockedRBC$ = this._lockedRBC$.asObservable();

  public readonly lockedRBCInDollars$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.lockedRBC$, from(this.getRBCPrice())]).pipe(
        map(([lockedRbcAmount, rbcPrice]) => lockedRbcAmount.multipliedBy(rbcPrice))
      )
    )
  );

  private readonly _totalSupply$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly totalSupply$ = this._totalSupply$.asObservable();

  private readonly numberOfSecondsPerYear = 31_104_000;

  private readonly numberOfSecondsPerWeek = 604_800;

  public currentStakingApr = new BigNumber(0);

  private readonly _rewardPerWeek$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly rewardPerWeek$ = this._rewardPerWeek$.asObservable();

  public readonly apr$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.lockedRBCInDollars$, from(this.getETHPrice()), this.rewardPerWeek$]).pipe(
        map(([lockedRbcInDollars, ethPrice, rewardPerWeek]) => {
          const rewardPerYear = rewardPerWeek
            .dividedBy(this.numberOfSecondsPerWeek)
            .multipliedBy(this.numberOfSecondsPerYear);
          const lockedRBCinETH = lockedRbcInDollars.dividedBy(ethPrice);
          const apr = rewardPerYear.dividedBy(lockedRBCinETH).multipliedBy(100);
          this.currentStakingApr = apr;

          return apr;
        })
      )
    )
  );

  public readonly circRBCLocked$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.lockedRBC$, this.totalSupply$]).pipe(
        map(([lockedRBC, totalSupply]) => lockedRBC.dividedBy(totalSupply).multipliedBy(100))
      )
    )
  );

  constructor() {}

  private static get blockchainAdapter(): EvmWeb3Public {
    return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ARBITRUM);
  }

  public getTotalSupply(): void {
    from(
      Injector.web3PublicService
        .getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM)
        .callContractMethod<string>(
          '0x3330BFb7332cA23cd071631837dC289B09C33333',
          STAKING_ROUND_THREE.TOKEN.abi,
          'totalSupply'
        )
    ).subscribe(value => {
      this._totalSupply$.next(Web3Pure.fromWei(value));
    });
  }

  public getRewardPerWeek(): void {
    from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'rewardRate'
      )
    ).subscribe((value: string) => {
      this._rewardPerWeek$.next(Web3Pure.fromWei(value).multipliedBy(this.numberOfSecondsPerWeek));
    });
  }

  public getLockedRBC(): void {
    from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        STAKING_ROUND_THREE.TOKEN.address,
        STAKING_ROUND_THREE.TOKEN.abi,
        'balanceOf',
        [STAKING_ROUND_THREE.NFT.address]
      )
    ).subscribe((value: string) => {
      this._lockedRBC$.next(Web3Pure.fromWei(value));
    });
  }

  public async getRBCPrice(): Promise<BigNumber> {
    return Injector.coingeckoApi.getTokenPrice({
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x3330bfb7332ca23cd071631837dc289b09c33333'
    });
  }

  public async getETHPrice(): Promise<BigNumber> {
    return Injector.coingeckoApi.getTokenPrice({
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: NATIVE_TOKEN_ADDRESS
    });
  }

  public updateStatistics(): void {
    this._updateStatistics$.next();
  }
}
