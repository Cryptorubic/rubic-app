import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, Web3Pure } from 'rubic-sdk';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { BlockchainData } from '@app/shared/models/blockchain/blockchain-data';
import {
  switchMap,
  startWith,
  filter,
  tap,
  BehaviorSubject,
  from,
  map,
  Observable,
  forkJoin,
  of,
  catchError
} from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { NFT_CONTRACT_ABI } from '../constants/NFT_CONTRACT_ABI';
import { REWARDS_CONTRACT_ABI } from '../constants/REWARDS_CONTRACT_ABI';
import { IntervalReward } from '../models/interval-rewards.interface';
import { Deposit } from '../models/deposit.inteface';
import { ErrorsService } from '@app/core/errors/errors.service';
import { StatisticsService } from './statistics.service';
import { StakingNotificationService } from './staking-notification.service';

@Injectable()
export class StakingService {
  public readonly RBC_TOKEN_ADDRESS = '0x8e3bcc334657560253b83f08331d85267316e08a';
  // public readonly RBC_TOKEN_ADDRESS = '0xd452d01C6348D3d5B35FA1d5500d23F8Ae65D6eA'; //fake rbc

  public readonly NFT_CONTRACT_ADDRESS = '0x3b67942461E2B487701748f63c1d24De7C72591E';

  public readonly REWARDS_CONTRACT_ADDRESS = '0x3d9aBCdf76bc969a860175E13Fe4Fc791E836D08';

  public readonly user$ = this.authService.getCurrentUser();

  private readonly _rbcTokenBalance$ = new BehaviorSubject<BigNumber>(null);

  public readonly rbcTokenBalance$ = this._rbcTokenBalance$.asObservable();

  public get rbcTokenBalance(): BigNumber {
    return this._rbcTokenBalance$.getValue();
  }

  private readonly _rbcAllowance$ = new BehaviorSubject<BigNumber>(null);

  public readonly rbcAllowance$ = this._rbcAllowance$.asObservable();

  get rbcAllowance(): BigNumber {
    return this._rbcAllowance$.getValue();
  }

  public get walletAddress(): string {
    return this.authService.userAddress;
  }

  public readonly needLogin$ = this.authService
    .getCurrentUser()
    .pipe(map(user => !Boolean(user?.address)));

  public readonly needSwitchNetwork$ = this.walletConnectorService.networkChange$.pipe(
    startWith(this.walletConnectorService.network),
    filter<BlockchainData>(Boolean),
    map(network => network?.name !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN)
  );

  private readonly web3Public = Injector.web3PublicService.getWeb3Public(
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  );

  private readonly web3Private = Injector.web3Private;

  private readonly _deposits$ = new BehaviorSubject<Deposit[]>(undefined);

  public readonly deposits$ = this._deposits$.asObservable();

  private readonly _total$ = new BehaviorSubject<{ balance: BigNumber; rewards: BigNumber }>({
    balance: null,
    rewards: null
  });

  public readonly total$ = this._total$.asObservable();

  private get total(): { balance: BigNumber; rewards: BigNumber } {
    return this._total$.getValue();
  }

  private get deposits(): Deposit[] {
    return this._deposits$.getValue();
  }

  private readonly _depositsLoading$ = new BehaviorSubject<boolean>(false);

  public readonly depositsLoading$ = this._depositsLoading$.asObservable();

  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorService: ErrorsService,
    private readonly ngZone: NgZone,
    private readonly stakingNotificationService: StakingNotificationService
  ) {
    this.user$
      .pipe(
        filter(user => Boolean(user?.address)),
        switchMap(() => this.getAllowance()),
        switchMap(() => this.getRbcTokenBalance())
      )
      .subscribe();
  }

  public getRbcAmountPrice(): Observable<number> {
    return from(
      this.tokensService.getAndUpdateTokenPrice(
        {
          address: '0x8e3bcc334657560253b83f08331d85267316e08a',
          blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        },
        true
      )
    );
  }

  public getAllowance(): Observable<BigNumber> {
    return from(
      this.web3Public.getAllowance(
        this.RBC_TOKEN_ADDRESS,
        this.walletAddress,
        this.NFT_CONTRACT_ADDRESS
      )
    ).pipe(
      map((allowance: BigNumber) => {
        console.log('allowance', allowance.toNumber());
        return Web3Pure.fromWei(allowance);
      }),
      tap((allowance: BigNumber) => this.setAllowance(allowance))
    );
  }

  public setAllowance(allowance: BigNumber | 'Infinity'): void {
    if (allowance === 'Infinity') {
      this._rbcAllowance$.next(new BigNumber(2).pow(256).minus(1));
    } else {
      this._rbcAllowance$.next(allowance);
    }
  }

  public getRbcTokenBalance(): Observable<BigNumber> {
    return from(this.web3Public.getTokenBalance(this.walletAddress, this.RBC_TOKEN_ADDRESS)).pipe(
      map((balance: string) => Web3Pure.fromWei(balance)),
      tap(balance => this._rbcTokenBalance$.next(balance))
    );
  }

  public async getCurrentTimeInSeconds(): Promise<number> {
    const currentBlock = await this.web3Public.getBlock();
    return Number(currentBlock.timestamp);
  }

  public async approveRbc(): Promise<TransactionReceipt> {
    return await Injector.web3Private.approveTokens(
      this.RBC_TOKEN_ADDRESS,
      this.NFT_CONTRACT_ADDRESS,
      'infinity'
    );
  }

  public async stake(amount: string, duration: number): Promise<TransactionReceipt> {
    const durationInSeconds = duration * 30 * 86400;
    console.log({
      duration,
      amount,
      durationInSeconds,
      amountInWei: Web3Pure.toWei(new BigNumber(amount.split(',').join('')), 18)
    });
    return Injector.web3Private.tryExecuteContractMethod(
      this.NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      'create_lock',
      [Web3Pure.toWei(new BigNumber(amount.split(',').join('')), 18), String(durationInSeconds)]
    );
  }

  public async claim(deposit: Deposit): Promise<TransactionReceipt> {
    try {
      const receipt = await Injector.web3Private.tryExecuteContractMethod(
        this.REWARDS_CONTRACT_ADDRESS,
        REWARDS_CONTRACT_ABI,
        'claimReward',
        [
          deposit.id,
          deposit.rewardIntervals.map(interval => [interval.startEpoch, interval.endEpoch])
        ]
      );
      if (receipt.status) {
        this.stakingNotificationService.showSuccessClaimNotification();
        this._total$.next({
          ...this.total,
          rewards: this.total.rewards.minus(deposit.totalNftRewards)
        });
        this.updateDepositById(deposit.id, { ...deposit, totalNftRewards: new BigNumber(0) });
      }
      return receipt;
    } catch (error) {
      this.errorService.catch(error);
      return null;
    }
  }

  private updateDepositById(id: string, deposit: Deposit): void {
    const updatedDeposits = this.deposits.map(item => {
      if (item.id === id) {
        return deposit;
      } else {
        return item;
      }
    });
    this._deposits$.next(updatedDeposits);
  }

  public async withdraw(deposit: Deposit): Promise<TransactionReceipt> {
    try {
      const receipt = await Injector.web3Private.tryExecuteContractMethod(
        this.NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        'withdraw',
        [deposit.id]
      );
      if (receipt.status) {
        this.stakingNotificationService.showSuccessWithdrawNotification();
        const updatedDeposits = this.deposits.filter(item => item.id !== deposit.id);
        this.ngZone.run(() => {
          this._total$.next({
            ...this.total,
            balance: this.total.balance.minus(deposit.amount)
          });
          this._deposits$.next(updatedDeposits);
        });
      }
      return receipt;
    } catch (error) {
      this.errorService.catch(error);
    }
  }

  public loadDeposits(): Observable<Deposit[]> {
    return this.user$.pipe(
      tap(() => this.setDepositsLoading(true)),
      switchMap(user => {
        if (!user?.address) {
          return of([]);
        }

        return from(this.getTokensByOwner(user.address)).pipe(
          switchMap((nftIds: string[]) => {
            if (nftIds.length === 0) {
              return of([]);
            }

            return forkJoin(
              nftIds.map(async id => {
                const nftInfo = await this.getNftInfo(id);
                const nftRewards = await this.getNftRewardsInfo(id);
                const nftVotingPower = await this.getNftVotingPower(id);
                const tokenApr = new BigNumber(nftVotingPower)
                  .dividedBy(Web3Pure.toWei(nftInfo.amount))
                  .multipliedBy(this.statisticsService.currentStakingApr);
                return { ...nftInfo, ...nftRewards, id, tokenApr };
              })
            );
          })
        );
      }),
      catchError((error: unknown) => {
        console.debug(error);
        return of([]);
      }),
      tap((deposits: Deposit[]) => {
        const totalBalance = deposits
          .map(deposit => deposit.amount)
          .reduce((prev, curr) => {
            return prev.plus(curr);
          }, new BigNumber(0));

        const totalRewards = deposits
          .map(deposit => deposit.totalNftRewards)
          .reduce((prev, curr) => {
            return prev.plus(curr);
          }, new BigNumber(0));

        console.log('deposits:', deposits);

        this.setDepositsLoading(false);

        this.ngZone.run(() => {
          this._deposits$.next(deposits);
          this._total$.next({ balance: totalBalance, rewards: totalRewards });
        });
      })
    );
  }

  public setDepositsLoading(value: boolean): void {
    this._depositsLoading$.next(value);
  }

  public async getTokensByOwner(walletAddress: string): Promise<string[]> {
    return this.web3Public.callContractMethod(
      this.NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      'viewTokensByOwner',
      { methodArguments: [walletAddress] }
    );
  }

  public async getNftInfo(nftId: string): Promise<{ amount: BigNumber; endTimestamp: number }> {
    const { amount, end } = await this.web3Public.callContractMethod(
      this.NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      'locked',
      { methodArguments: [nftId] }
    );
    return { amount: Web3Pure.fromWei(amount), endTimestamp: Number(end) * 1000 };
  }

  public async getNftRewardsInfo(
    nftId: string
  ): Promise<{ totalNftRewards: BigNumber; rewardIntervals: IntervalReward[] }> {
    try {
      const currentEpoch = await this.web3Public.callContractMethod(
        this.REWARDS_CONTRACT_ADDRESS,
        REWARDS_CONTRACT_ABI,
        'getCurrentEpochId'
      );
      console.log(currentEpoch);
      const rewardIntervals = await this.web3Public.callContractMethod<IntervalReward[]>(
        this.REWARDS_CONTRACT_ADDRESS,
        REWARDS_CONTRACT_ABI,
        'pendingReward',
        {
          methodArguments: [nftId, 0, currentEpoch]
        }
      );
      const totalNftRewards = rewardIntervals
        .map((interval: IntervalReward) => Web3Pure.fromWei(interval.reward))
        .reduce((prev: BigNumber, curr: BigNumber) => {
          return prev.plus(curr);
        }, new BigNumber(0));

      return { totalNftRewards, rewardIntervals };
    } catch (error) {
      return { totalNftRewards: new BigNumber(0), rewardIntervals: [] };
    }
  }

  public async switchNetwork(): Promise<boolean> {
    return this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }

  public async getNftVotingPower(nftId: string): Promise<string> {
    return await this.web3Public.callContractMethod(
      this.NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      'balanceOfNFT',
      { methodArguments: [nftId] }
    );
  }

  public async getIsStakingFinished(): Promise<boolean> {
    return await this.web3Public.callContractMethod(
      this.NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      'finishedStaking'
    );
  }

  public parseAmountToBn(value: string): BigNumber {
    if (value) {
      return new BigNumber(String(value).split(',').join(''));
    } else {
      return new BigNumber(NaN);
    }
  }
}
