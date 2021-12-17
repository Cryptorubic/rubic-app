import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';

import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3PublicService } from '@app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Web3Public } from '@app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { STAKING_CONTRACT_ABI } from '../constants/XBRBC_CONTRACT_ABI';
import { Web3PrivateService } from '@app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import { switchIif } from '@app/shared/utils/utils';
import { StakingApiService } from '@core/services/backend/staking-api/staking-api.service';
import { MinimalToken } from '@shared/utils/utils';

@Injectable()
export class StakingService {
  private readonly stakingContractAddress = '0x2C85DAf343e31fB871Bae1b1BFBD790d81BAE855'; //xBRBC testnet

  private _canReceiveAmount$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private _apr$ = new BehaviorSubject<number>(undefined);

  private _userEnteredAmount$ = new BehaviorSubject<number>(0);

  private _totalRBCEntered$ = new BehaviorSubject<number>(0);

  private _stakingTokenBalance$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private _earnedRewards$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private _selectedToken$ = new BehaviorSubject<MinimalToken>(undefined);

  private walletAddress: string;

  get userEnteredAmount$(): Observable<number> {
    return this._userEnteredAmount$
      .asObservable()
      .pipe(map(amount => Web3Public.fromWei(amount, 18).toNumber()));
  }

  get totalRBCEntered$(): Observable<number> {
    return this._totalRBCEntered$
      .asObservable()
      .pipe(map(amount => Web3Public.fromWei(amount, 18).toNumber()));
  }

  get apr$(): Observable<number> {
    return this._apr$.asObservable();
  }

  get canReceiveAmount$(): Observable<BigNumber> {
    return this._canReceiveAmount$.asObservable();
  }

  get stakingTokenBalance$(): Observable<BigNumber> {
    return this._stakingTokenBalance$.asObservable();
  }

  get earnedRewards$(): Observable<BigNumber> {
    return this._earnedRewards$.asObservable();
  }

  get needLogin$(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(map(user => !user?.address));
  }

  get selectedToken$(): Observable<MinimalToken> {
    return this._selectedToken$;
  }

  get selectedToken(): MinimalToken {
    return this._selectedToken$.getValue();
  }

  get selectedTokenBalance$(): Observable<BigNumber> {
    return this.needLogin$.pipe(
      switchMap(needLogin => {
        if (needLogin) {
          return of(new BigNumber(0));
        }
        return this.getSelectedTokenBalance(this.selectedToken.address);
      })
    );
  }

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly authService: AuthService,
    private readonly stakingApiService: StakingApiService
  ) {
    this.authService
      .getCurrentUser()
      .pipe(filter(Boolean))
      .subscribe(({ address }) => (this.walletAddress = address));
  }

  public setToken(token: MinimalToken): void {
    this._selectedToken$.next(token);
  }

  public enterStake(amount: BigNumber): Observable<TransactionReceipt> {
    const enterStake$ = from(
      this.web3PrivateService.tryExecuteContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'enter',
        [Web3Public.toWei(amount, 18)]
      )
    );

    return this.needApprove(amount).pipe(
      take(1),
      switchIif(
        needApprove => Boolean(needApprove),
        () => this.approve().pipe(switchMap(() => enterStake$)),
        () => enterStake$
      )
    );
  }

  public leaveStake(amount: string): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService.tryExecuteContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'leave',
        [Web3Public.toWei(new BigNumber(amount.split(',').join('')), 18)]
      )
    );
  }

  private needApprove(amount: BigNumber): Observable<boolean> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].getAllowance(
        this.selectedToken.address,
        this.walletAddress,
        this.stakingContractAddress
      )
    ).pipe(map(allowance => amount.gt(Web3Public.fromWei(allowance, 18))));
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

  // public getAllStatistics() {}

  public getStakingTokenBalance(): void {
    this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
      .getTokenBalance(this.walletAddress, this.stakingContractAddress)
      .then(balance => this._stakingTokenBalance$.next(Web3Public.fromWei(balance, 18)));
  }

  private getCanReceiveAmount(): void {
    this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
      .callContractMethod(this.stakingContractAddress, STAKING_CONTRACT_ABI, 'canReceive', {
        methodArguments: [Web3Public.toWei(this._stakingTokenBalance$.getValue(), 18)],
        from: this.walletAddress
      })
      .then(canReceiveAmount =>
        this._canReceiveAmount$.next(Web3Public.fromWei(canReceiveAmount, 18))
      );
  }

  // public getApr() {
  //   this.stakingApiService.getApr();
  // }

  public loadTotalRbcEntered(): void {
    this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
      .callContractMethod(this.stakingContractAddress, STAKING_CONTRACT_ABI, 'totalRBCEntered')
      .then(totalRbcEntered => {
        this._totalRBCEntered$.next(+totalRbcEntered);
      });
  }

  public loadUserEnteredAmount(): void {
    this.needLogin$.pipe(distinctUntilChanged()).subscribe(needLogin => {
      if (!needLogin) {
        this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
          .callContractMethod(
            this.stakingContractAddress,
            STAKING_CONTRACT_ABI,
            'userEnteredAmount',
            {
              methodArguments: [this.walletAddress]
            }
          )
          .catch(error => console.error('userEnteredAmount', error))
          .then(userEnteredAmount => this._userEnteredAmount$.next(+userEnteredAmount));
      }
    });
  }

  public reloadStakingProgress(): Observable<boolean> {
    this.loadTotalRbcEntered();
    return this.needLogin$.pipe(
      take(1),
      tap(needLogin => {
        if (!needLogin) {
          this.loadUserEnteredAmount();
        }
      })
    );
  }

  public calculateLeaveReward(amount: string): Observable<number | BigNumber> {
    if (!amount) {
      return of(0);
    }
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'canReceive',
        { methodArguments: [new BigNumber(amount.split(',').join(''))], from: this.walletAddress }
      )
    ).pipe(map(res => Web3Public.fromWei(res, 18)));
  }
}
