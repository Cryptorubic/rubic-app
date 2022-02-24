import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, EMPTY, forkJoin, from, Observable, Subject } from 'rxjs';
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
import { LP_PROVIDING_CONTRACT_ABI } from '../constants/LP_PROVIDING_CONTRACT_ABI';
import { POOL_TOKENS } from '../constants/POOL_TOKENS';
import { LpError } from '../models/lp-error.enum';
import { LiquidityPeriod } from '../models/lp-period.enum';
import { TransactionReceipt } from 'web3-eth';
import { ErrorsService } from '@app/core/errors/errors.service';
import { TokenLp, TokenLpParsed } from '../models/token-lp.interface';
import { StakingInfo } from '../models/staking-info.interface';
import { LpRateEnum } from '../models/lp-rate.enum';

interface DepositsResult {
  collectedRewards: Array<string>;
  parsedArrayOfTokens: Array<TokenLp>;
  rewardsToCollect: Array<string>;
}

@Injectable()
export class LpProvidingService {
  private readonly lpProvidingContract = ENVIRONMENT.lpProviding.contractAddress;

  public readonly minEnterAmount = ENVIRONMENT.lpProviding.minEnterAmount;

  public readonly maxEnterAmount = ENVIRONMENT.lpProviding.maxEnterAmount;

  public readonly poolSize = ENVIRONMENT.lpProviding.poolSize;

  private readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  private readonly brbcAddress = POOL_TOKENS[0].address;

  private readonly usdcAddress = POOL_TOKENS[1].address;

  public readonly userAddress$ = this.authService.getCurrentUser().pipe(
    distinctUntilChanged((x, y) => {
      return x?.address === y?.address;
    })
  );

  public readonly needLogin$ = this.authService
    .getCurrentUser()
    .pipe(map(user => !Boolean(user?.address)));

  private _usdcBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public usdcBalance$ = this._usdcBalance$.asObservable();

  private _brbcBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public brbcBalance$ = this._brbcBalance$.asObservable();

  private readonly _infoLoading$ = new BehaviorSubject<boolean>(true);

  public readonly infoLoading$ = this._infoLoading$.asObservable();

  private readonly _progressLoading$ = new BehaviorSubject<boolean>(true);

  public readonly progressLoading$ = this._progressLoading$.asObservable();

  private readonly _depositsLoading$ = new BehaviorSubject<boolean>(false);

  public readonly depositsLoading$ = this._depositsLoading$.asObservable();

  private readonly _deposits$ = new BehaviorSubject<TokenLpParsed[]>(undefined);

  public readonly deposits$ = this._deposits$.asObservable();

  private readonly _totalCollectedAmount$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly totalCollectedAmount$ = this._totalCollectedAmount$.asObservable();

  private readonly _amountToCollect$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly amountToCollect$ = this._amountToCollect$.asObservable();

  private readonly _totalStaked$ = new BehaviorSubject<number>(0);

  public readonly totalStaked$ = this._totalStaked$.asObservable();

  private readonly _userTotalStaked$ = new BehaviorSubject<number>(0);

  public readonly userTotalStaked$ = this._userTotalStaked$.asObservable();

  private readonly _apr$ = new BehaviorSubject<number>(undefined);

  public readonly apr$ = this._apr$.asObservable();

  private readonly _balance$ = new BehaviorSubject<number>(0);

  public readonly balance$ = this._balance$.asObservable();

  public readonly _brbcAllowance$ = new Subject<BigNumber>();

  public readonly needBrbcApprove$ = this._brbcAllowance$
    .asObservable()
    .pipe(map(allowance => allowance.lt(Web3Pure.toWei(this.maxEnterAmount))));

  public readonly _usdcAllowance$ = new Subject<BigNumber>();

  public readonly needUsdcApprove$ = this._usdcAllowance$
    .asObservable()
    .pipe(map(allowance => allowance.lt(Web3Pure.toWei(this.maxEnterAmount))));

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: PrivateBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService
  ) {}

  public getLpProvidingInfo(): Observable<(number | BigNumber)[] | string> {
    return this.userAddress$.pipe(
      tap(() => this.setInfoLoading(true)),
      switchMap(user => {
        if (user?.address) {
          return from(
            this.web3PublicService[this.blockchain].callContractMethod<StakingInfo>(
              this.lpProvidingContract,
              LP_PROVIDING_CONTRACT_ABI,
              'stakingInfoParsed',
              { methodArguments: [user.address], from: user.address }
            )
          ).pipe(
            catchError((error: unknown) => {
              this.errorService.catchAnyError(error as Error);
              return EMPTY;
            }),
            map(result => {
              const { amountToCollectTotal, amountCollectedTotal, aprInfo } = result;
              return [
                Web3Pure.fromWei(amountToCollectTotal),
                Web3Pure.fromWei(amountCollectedTotal),
                this.parseApr(aprInfo)
              ];
            }),
            tap(([amountToCollect, amountCollectedTotal, apr]) => {
              this._amountToCollect$.next(amountToCollect as BigNumber);
              this._totalCollectedAmount$.next(amountCollectedTotal as BigNumber);
              this._apr$.next(apr as number);
            })
          );
        } else {
          return this.getApr().pipe(
            tap(() => {
              if (user?.address === null) {
                this._balance$.next(0);
              }
            })
          );
        }
      })
    );
  }

  public getApr(): Observable<string> {
    return from(
      this.web3PublicService[this.blockchain].callContractMethod<string>(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'apr'
      )
    ).pipe(tap(apr => this._apr$.next(this.parseApr(apr))));
  }

  public setInfoLoading(value: boolean): void {
    this._infoLoading$.next(value);
  }

  public getLpProvidingProgress(): Observable<BigNumber[] | BigNumber> {
    return this.userAddress$.pipe(
      tap(() => this.setProgressLoading(true)),
      switchMap(user => {
        if (user?.address) {
          return from(
            this.web3PublicService[this.blockchain].callContractMethod<BigNumber[]>(
              this.lpProvidingContract,
              LP_PROVIDING_CONTRACT_ABI,
              'stakingProgressParsed',
              { methodArguments: [user.address], from: user.address }
            )
          ).pipe(
            map(data => {
              const { '0': yourTotalUSDC, '1': totalUSDC } = data;

              return [yourTotalUSDC, totalUSDC];
            })
          );
        } else {
          return this.getTotalStaked();
        }
      }),
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      tap(data => {
        if (Array.isArray(data)) {
          const [usersTotalStaked, totalStaked] = data;
          const usersTotalStakedInTokens = Web3Pure.fromWei(usersTotalStaked).toNumber();
          const totalStakedInTokens = Web3Pure.fromWei(totalStaked).toNumber();

          this._totalStaked$.next(totalStakedInTokens);
          this._userTotalStaked$.next(usersTotalStakedInTokens);
          this._balance$.next(usersTotalStakedInTokens / totalStakedInTokens);
        } else {
          this._totalStaked$.next(Web3Pure.fromWei(data).toNumber());
        }
      })
    );
  }

  public setProgressLoading(value: boolean): void {
    this._progressLoading$.next(value);
  }

  public getTotalStaked(): Observable<BigNumber> {
    return from(
      this.web3PublicService[this.blockchain].callContractMethod<BigNumber>(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'totalPoolStakedUSDC'
      )
    );
  }

  public getAndUpdatePoolTokensBalances(address?: string): Observable<BigNumber[]> {
    return from(
      this.web3PublicService[this.blockchain].getTokensBalances(
        address || this.authService.userAddress,
        [this.usdcAddress, this.brbcAddress]
      )
    ).pipe(
      tap(([usdcBalance, brbcBalance]) => {
        this._usdcBalance$.next(Web3Pure.fromWei(usdcBalance));
        this._brbcBalance$.next(Web3Pure.fromWei(brbcBalance));
      })
    );
  }

  public getDeposits(): Observable<TokenLpParsed[]> {
    return this.userAddress$.pipe(
      filter(user => Boolean(user?.address)),
      tap(() => this.setDepositsLoading(true)),
      switchMap(user => {
        return from(
          this.web3PublicService[this.blockchain].callContractMethod<DepositsResult>(
            this.lpProvidingContract,
            LP_PROVIDING_CONTRACT_ABI,
            'infoAboutDepositsParsed',
            { methodArguments: [user.address], from: user.address }
          )
        ).pipe(
          catchError((error: unknown) => {
            this.errorService.catchAnyError(error as Error);
            return EMPTY;
          }),
          map(deposits => this.parseDeposits(deposits)),
          tap(deposits => {
            console.log(deposits);
            this._deposits$.next(deposits);
          })
        );
      })
    );
  }

  public setDepositsLoading(value: boolean): void {
    this._depositsLoading$.next(value);
  }

  public getNeedTokensApprove(): Observable<BigNumber[]> {
    return forkJoin([
      from(
        this.web3PublicService[this.blockchain].getAllowance({
          tokenAddress: this.usdcAddress,
          ownerAddress: this.authService.userAddress,
          spenderAddress: this.lpProvidingContract
        })
      ),
      from(
        this.web3PublicService[this.blockchain].getAllowance({
          tokenAddress: this.brbcAddress,
          ownerAddress: this.authService.userAddress,
          spenderAddress: this.lpProvidingContract
        })
      )
    ]).pipe(
      tap(([usdcAllowance, brbcAllowance]) => {
        this._usdcAllowance$.next(usdcAllowance);
        this._brbcAllowance$.next(brbcAllowance);
      })
    );
  }

  public approvePoolToken(token: 'usdc' | 'brbc'): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService[this.blockchain].approveTokens(
        token === 'usdc' ? this.usdcAddress : this.brbcAddress,
        this.lpProvidingContract,
        'infinity'
      )
    );
  }

  public approveNftToken(spenderAddress: string, nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'approve',
      [spenderAddress, nftId]
    );
  }

  public requestWithdraw(tokenId: string): Observable<unknown> {
    return from(
      this.web3PrivateService[this.blockchain].executeContractMethod(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'requestWithdraw',
        [tokenId]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      tap(() => {
        const deposits = this._deposits$.getValue();
        const updatedDeposits = deposits.map(deposit => {
          if (deposit.tokenId === tokenId) {
            return { ...deposit, isStaked: false };
          } else {
            return deposit;
          }
        });

        this._deposits$.next(updatedDeposits);
      })
    );
  }

  public stake(amount: BigNumber, period: number): Observable<BigNumber[]> {
    return from(
      this.web3PrivateService[this.blockchain].executeContractMethodWithOnHashResolve(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'stake',
        [Web3Pure.toWei(amount), period * 24 * 60 * 60]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      switchMap(() => this.getAndUpdatePoolTokensBalances())
    );
  }

  public collectRewards(tokenId: string): Observable<unknown> {
    return from(
      this.web3PrivateService[this.blockchain].executeContractMethodWithOnHashResolve(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'claimRewards',
        [tokenId]
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catchAnyError(error as Error);
        return EMPTY;
      }),
      switchMap(() => this.getDeposits()),
      take(1)
    );
  }

  public async switchNetwork(): Promise<boolean> {
    return await this.walletConnectorService.switchChain(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
    );
  }

  public checkAmountAndPeriodForErrors(
    amount: BigNumber,
    balance: BigNumber,
    period: number
  ): LpError | null {
    if (period < LiquidityPeriod.SHORT) {
      return LpError.INVALID_PERIOD;
    }

    if (amount.gt(this.maxEnterAmount)) {
      return LpError.LIMIT_GT_MAX;
    }

    if (amount.lt(this.minEnterAmount)) {
      return LpError.LIMIT_LT_MIN;
    }

    if (balance && amount.gt(balance)) {
      return LpError.INSUFFICIENT_BALANCE;
    }

    if (!amount.isFinite()) {
      return LpError.EMPTY_AMOUNT;
    }

    return null;
  }

  public getRate(days: number): number {
    if (days < LiquidityPeriod.AVERAGE) {
      return LpRateEnum.SHORT;
    }

    if (days < LiquidityPeriod.LONG && days >= LiquidityPeriod.AVERAGE) {
      return LpRateEnum.AVERAGE;
    }

    return LpRateEnum.LONG;
  }

  public async calculateUsdPrice(value: BigNumber, token: 'brbc' | 'usdc'): Promise<BigNumber> {
    const usdPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: token === 'brbc' ? this.brbcAddress : this.usdcAddress,
      blockchain: this.blockchain
    });

    return value.multipliedBy(usdPrice);
  }

  public parseInputValue(value: string): BigNumber {
    if (value) {
      return new BigNumber(String(value).split(',').join(''));
    } else {
      return new BigNumber(NaN);
    }
  }

  private parseDeposits(deposits: DepositsResult): TokenLpParsed[] {
    const { parsedArrayOfTokens, collectedRewards, rewardsToCollect } = deposits;

    return parsedArrayOfTokens.map((tokenInfo: TokenLp, i: number) => {
      const { startTime, deadline } = tokenInfo;
      const start = new Date(Number(startTime) * 1000);
      const period = Math.floor((Number(deadline) - Number(startTime)) / (3600 * 24));
      return {
        ...tokenInfo,
        USDCAmount: Web3Pure.fromWei(tokenInfo.USDCAmount),
        BRBCAmount: Web3Pure.fromWei(tokenInfo.BRBCAmount),
        collectedRewards: Web3Pure.fromWei(collectedRewards[i]),
        rewardsToCollect: Web3Pure.fromWei(rewardsToCollect[i]),
        start,
        period
      };
    });
  }

  private parseApr(apr: string): number {
    return Number(apr) / Math.pow(10, 29);
  }
}
