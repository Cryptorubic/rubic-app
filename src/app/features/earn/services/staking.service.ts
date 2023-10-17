import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, Web3Pure, Injector } from 'rubic-sdk';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  firstValueFrom,
  forkJoin,
  from,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer
} from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { Deposit } from '../models/deposit.inteface';
import { ErrorsService } from '@app/core/errors/errors.service';
import { StatisticsService } from './statistics.service';
import { StakingNotificationService } from './staking-notification.service';
import { NavigationEnd, Router } from '@angular/router';
import { MILLISECONDS_IN_MONTH, SECONDS_IN_MONTH } from '@app/shared/constants/time/time';
import { TableTotal } from '../models/table-total.interface';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';
import { STAKING_ROUND_THREE } from '@features/earn/constants/STAKING_ROUND_THREE';
import { GasService } from '@core/services/gas-service/gas.service';
import { GasInfo } from '@core/services/gas-service/models/gas-info';

const STAKING_END_TIMESTAMP = new Date(2024, 6, 10).getTime();

@Injectable()
export class StakingService {
  public readonly MIN_STAKE_AMOUNT = 1;

  public readonly MAX_LOCK_TIME =
    Math.floor(Math.trunc((STAKING_END_TIMESTAMP - Date.now()) / MILLISECONDS_IN_MONTH) / 3) * 3;

  public readonly user$ = this.authService.currentUser$;

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

  public readonly needLogin$ = this.authService.currentUser$.pipe(
    map(user => !Boolean(user?.address))
  );

  public readonly needSwitchNetwork$ = this.walletConnectorService.networkChange$.pipe(
    filter(Boolean),
    map(blockchainName => blockchainName !== BLOCKCHAIN_NAME.ARBITRUM)
  );

  private readonly web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ARBITRUM);

  private readonly _deposits$ = new BehaviorSubject<Deposit[]>([]);

  public readonly deposits$ = this._deposits$.asObservable();

  private readonly _total$ = new BehaviorSubject<TableTotal>({
    balance: null,
    rewards: null
  });

  public readonly total$ = this._total$.asObservable();

  private get total(): TableTotal {
    return this._total$.getValue();
  }

  private get deposits(): Deposit[] {
    return this._deposits$.getValue();
  }

  private readonly _depositsLoading$ = new BehaviorSubject<boolean>(false);

  public readonly depositsLoading$ = this._depositsLoading$.asObservable();

  private readonly _stopWatchUserBalanceAndAllowance$ = new Subject<void>();

  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorService: ErrorsService,
    private readonly ngZone: NgZone,
    private readonly stakingNotificationService: StakingNotificationService,
    private readonly router: Router,
    private readonly gasService: GasService
  ) {
    this.watchUserBalanceAndAllowance();
  }

  public getRbcAmountPrice(): Observable<number> {
    return from(
      this.tokensService.getAndUpdateTokenPrice(
        {
          address: '0x3330bfb7332ca23cd071631837dc289b09c33333',
          blockchain: BLOCKCHAIN_NAME.ETHEREUM
        },
        true
      )
    );
  }

  public watchUserBalanceAndAllowance(): void {
    const routerEvents$ = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
    const userBalanceAndAllowance$ = this.user$.pipe(
      filter(user => Boolean(user?.address)),
      switchMap(() => this.getAllowance()),
      switchMap(() => this.getRbcTokenBalance())
    );
    combineLatest([routerEvents$, userBalanceAndAllowance$])
      .pipe(takeUntil(this._stopWatchUserBalanceAndAllowance$))
      .subscribe(([event]: [NavigationEnd, BigNumber]) => {
        if (!event.url.includes('staking')) {
          this._stopWatchUserBalanceAndAllowance$.next();
        }
      });
  }

  public getAllowance(): Observable<BigNumber> {
    return from(
      this.web3Public.getAllowance(
        STAKING_ROUND_THREE.TOKEN.address,
        this.walletAddress,
        STAKING_ROUND_THREE.NFT.address
      )
    ).pipe(
      map((allowance: BigNumber) => Web3Pure.fromWei(allowance)),
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
    const amount$: Observable<BigNumber> = this.walletAddress
      ? from(this.web3Public.getTokenBalance(this.walletAddress, STAKING_ROUND_THREE.TOKEN.address))
      : of(new BigNumber(0));
    return amount$.pipe(
      map(balance => Web3Pure.fromWei(balance)),
      tap(balance => this._rbcTokenBalance$.next(balance))
    );
  }

  private estimatedAnnualRewardsByTokenId(tokenID: string): Promise<string> {
    return this.web3Public.callContractMethod(
      STAKING_ROUND_THREE.NFT.address,
      STAKING_ROUND_THREE.NFT.abi,
      'estimatedAnnualRewardsByTokenId',
      [tokenID]
    );
  }

  public pollRbcTokens(): Observable<BigNumber> {
    const pollInterval = 15_000;
    return timer(0, pollInterval).pipe(switchMap(() => this.getRbcTokenBalance()));
  }

  public async getCurrentTimeInSeconds(): Promise<number> {
    const currentBlock = await this.web3Public.getBlock();
    return Number(currentBlock.timestamp);
  }

  public async getGasInfo(): Promise<GasInfo> {
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      BLOCKCHAIN_NAME.ARBITRUM
    );

    return { shouldCalculateGasPrice, gasPriceOptions };
  }

  public async approveRbc(): Promise<TransactionReceipt> {
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.getGasInfo();

    try {
      const receipt = await Injector.web3PrivateService
        .getWeb3Private(CHAIN_TYPE.EVM)
        .approveTokens(
          STAKING_ROUND_THREE.TOKEN.address,
          STAKING_ROUND_THREE.NFT.address,
          'infinity',
          { ...(shouldCalculateGasPrice && { gasPriceOptions }) }
        );

      if (receipt && receipt.status) {
        this.stakingNotificationService.showSuccessApproveNotification();
        this.setAllowance('Infinity');
      }

      return receipt;
    } catch (error) {
      this.errorService.catch(error);
      return null;
    }
  }

  public async stake(amount: BigNumber, duration: number): Promise<TransactionReceipt> {
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.getGasInfo();

    const durationInSeconds = duration * SECONDS_IN_MONTH;
    return Injector.web3PrivateService
      .getWeb3Private(CHAIN_TYPE.EVM)
      .tryExecuteContractMethod(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'enterStaking',
        [Web3Pure.toWei(amount, 18), String(durationInSeconds)],
        { ...(shouldCalculateGasPrice && { gasPriceOptions }) }
      );
  }

  public async claim(deposit: Deposit): Promise<TransactionReceipt> {
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.getGasInfo();

    try {
      const receipt = await Injector.web3PrivateService
        .getWeb3Private(CHAIN_TYPE.EVM)
        .tryExecuteContractMethod(
          STAKING_ROUND_THREE.NFT.address,
          STAKING_ROUND_THREE.NFT.abi,
          'claimRewards',
          [deposit.id],
          { ...(shouldCalculateGasPrice && { gasPriceOptions }) }
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
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.getGasInfo();

    try {
      const receipt = await Injector.web3PrivateService
        .getWeb3Private(CHAIN_TYPE.EVM)
        .tryExecuteContractMethod(
          STAKING_ROUND_THREE.NFT.address,
          STAKING_ROUND_THREE.NFT.abi,
          'unstake',
          [deposit.id],
          { ...(shouldCalculateGasPrice && { gasPriceOptions }) }
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

  public async isEmergencyStopped(): Promise<boolean> {
    try {
      return await this.web3Public.callContractMethod(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'emergencyStop'
      );
    } catch (error) {
      return;
    }
  }

  public loadDeposits(): Observable<Deposit[]> {
    return this.user$.pipe(
      tap(() => this.setDepositsLoading(true)),
      switchMap(() => {
        if (!this.authService?.user?.address) {
          return of([]);
        }

        return from(this.getTokensByOwner(this.authService.user.address)).pipe(
          switchMap((nftIds: string[]) => {
            if (nftIds.length === 0) {
              return of([]);
            }

            return forkJoin(
              nftIds.map(async id => {
                const estimatedAnnualRewardsWithDecimals =
                  await this.estimatedAnnualRewardsByTokenId(id);
                const nftInfo = await this.getNftInfo(id);
                const nftRewards = await this.getNftRewardsInfo(id);

                const RBCPrice = await firstValueFrom(this.statisticsService.getRBCPrice());
                const ethPrice = await firstValueFrom(this.statisticsService.getETHPrice());
                const amountInDollars = nftInfo.amount.multipliedBy(RBCPrice);
                const amountInETH = amountInDollars.dividedBy(ethPrice);
                const estimatedAnnualRewards = Web3Pure.fromWei(estimatedAnnualRewardsWithDecimals); // in ETH
                const tokenApr = estimatedAnnualRewards.dividedBy(amountInETH).multipliedBy(100);

                return {
                  ...nftInfo,
                  ...nftRewards,
                  id,
                  tokenApr,
                  canWithdraw:
                    Date.now() > nftInfo.endTimestamp || (await this.isEmergencyStopped())
                };
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
      STAKING_ROUND_THREE.NFT.address,
      STAKING_ROUND_THREE.NFT.abi,
      'tokensOfOwner',
      [walletAddress]
    );
  }

  public async getNftInfo(nftId: string): Promise<{ amount: BigNumber; endTimestamp: number }> {
    const { lockTime, amount, lockStartTime } = await this.web3Public.callContractMethod<{
      lockTime: string;
      lockStartTime: string;
      amount: string;
    }>(STAKING_ROUND_THREE.NFT.address, STAKING_ROUND_THREE.NFT.abi, 'stakes', [nftId]);
    const endTimestamp = Number(lockStartTime) + Number(lockTime);

    return {
      amount: Web3Pure.fromWei(amount),
      endTimestamp: endTimestamp * 1000
    };
  }

  public async getNftRewardsInfo(nftId: string): Promise<{ totalNftRewards: BigNumber }> {
    try {
      const calculatedRewards = await this.web3Public.callContractMethod(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'calculateRewards',
        [nftId]
      );
      return { totalNftRewards: Web3Pure.fromWei(calculatedRewards) };
    } catch (error) {
      return { totalNftRewards: new BigNumber(0) };
    }
  }

  public async switchNetwork(): Promise<boolean> {
    return this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.ARBITRUM);
  }

  public async getNftVotingPower(nftId: string): Promise<string> {
    return await this.web3Public.callContractMethod(
      STAKING_ROUND_THREE.NFT.address,
      STAKING_ROUND_THREE.NFT.abi,
      'balanceOfNFT',
      [nftId]
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
