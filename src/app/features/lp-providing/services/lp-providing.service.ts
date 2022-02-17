import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Web3Pure } from '@app/core/services/blockchain/blockchain-adapters/common/web3-pure';
import { PrivateBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { ENVIRONMENT } from 'src/environments/environment';
import { LP_PROVIDING_CONTRACT_ABI } from '../constants/LP_PROVIDING_CONTRACT_ABI';
import { POOL_TOKENS } from '../constants/POOL_TOKENS';
import { LpError } from '../models/lp-error.enum';
import { LiquidityPeriod } from '../models/lp-period.enum';
import { TransactionReceipt } from 'web3-eth';
import { ErrorsService } from '@app/core/errors/errors.service';
import { TokenLp, TokenLpParsed } from '../models/token-lp.interface';
import { StakingInfo } from '../models/staking-info.interface';

interface DepositsResult {
  '0': Array<TokenLp & { [index: number]: boolean | number | string }>;
  '1': Array<string>;
  '2': Array<string>;
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

  public readonly userAddress$ = this.authService.getCurrentUser().pipe(distinctUntilChanged());

  public readonly needLogin$ = this.authService
    .getCurrentUser()
    .pipe(map(user => !Boolean(user?.address)));

  //----

  private _usdcBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public usdcBalance$ = this._usdcBalance$.asObservable();

  private _brbcBalance$ = new BehaviorSubject<BigNumber>(undefined);

  public brbcBalance$ = this._brbcBalance$.asObservable();

  //----

  public infoLoading$ = new BehaviorSubject<boolean>(true);

  public progressLoading$ = new BehaviorSubject<boolean>(true);

  public depositsLoading$ = new BehaviorSubject<boolean>(false);

  private readonly _deposits$ = new BehaviorSubject<TokenLpParsed[]>(undefined);

  public readonly deposits$ = this._deposits$.asObservable();

  public readonly totalCollectedAmount$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly amountToCollect$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly totalStaked$ = new BehaviorSubject<number>(undefined);

  public readonly userTotalStaked$ = new BehaviorSubject<number>(undefined);

  public readonly apr$ = new BehaviorSubject<number>(undefined);

  public readonly balance$ = new BehaviorSubject<number>(0);

  //----

  public readonly needBrbcApprove$ = new BehaviorSubject<boolean>(true);

  public readonly needUsdcApprove$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: PrivateBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService,
    private readonly errorService: ErrorsService
  ) {}

  public getLpProvidingInfo(): Observable<(number | BigNumber)[] | number> {
    return this.userAddress$.pipe(
      tap(() => this.infoLoading$.next(true)),
      switchMap(user => {
        if (user?.address) {
          return combineLatest([this.totalStaked$, this.userTotalStaked$]).pipe(
            switchMap(([totalStaked, userTotalStaked]) => {
              return from(
                this.web3PublicService[this.blockchain].callContractMethod<StakingInfo>(
                  this.lpProvidingContract,
                  LP_PROVIDING_CONTRACT_ABI,
                  'stakingInfoParsed',
                  { methodArguments: [user.address], from: user.address }
                )
              ).pipe(
                map(result => {
                  const { amountToCollectTotal, amountCollectedTotal, aprInfo } = result;
                  return [
                    userTotalStaked / totalStaked,
                    Web3Pure.fromWei(amountToCollectTotal),
                    Web3Pure.fromWei(amountCollectedTotal),
                    this.parseApr(aprInfo)
                  ];
                })
              );
            }),
            tap(([balance, amountToCollect, amountCollectedTotal, apr]) => {
              this.balance$.next(balance as number);
              this.amountToCollect$.next(amountToCollect as BigNumber);
              this.totalCollectedAmount$.next(amountCollectedTotal as BigNumber);
              this.apr$.next(apr as number);
            })
          );
        } else {
          return this.getApr();
        }
      })
    );
  }

  public getApr(): Observable<number> {
    return from(
      this.web3PublicService[this.blockchain].callContractMethod<string>(
        this.lpProvidingContract,
        LP_PROVIDING_CONTRACT_ABI,
        'apr'
      )
    ).pipe(
      map(apr => {
        return this.parseApr(apr);
      }),
      tap(apr => this.apr$.next(apr))
    );
  }

  public getLpProvidingProgress(): Observable<BigNumber[]> {
    return this.userAddress$.pipe(
      switchMap(user => {
        this.progressLoading$.next(true);
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
          return of([new BigNumber(1), new BigNumber(1)]);
        }
      }),
      tap(data => {
        const [usersTotalStaked, totalStaked] = data;
        this.totalStaked$.next(Web3Pure.fromWei(totalStaked).toNumber());
        this.userTotalStaked$.next(Web3Pure.fromWei(usersTotalStaked).toNumber());
      })
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
      tap(() => this.depositsLoading$.next(true)),
      switchMap(user => {
        return from(
          this.web3PublicService[this.blockchain].callContractMethod<DepositsResult>(
            this.lpProvidingContract,
            LP_PROVIDING_CONTRACT_ABI,
            'infoAboutDepositsParsed',
            { methodArguments: [user.address], from: user.address }
          )
        ).pipe(
          map(deposits => this.parseDeposits(deposits)),
          tap(deposits => {
            this._deposits$.next(deposits);
            this.depositsLoading$.next(false);
          })
        );
      })
    );
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
        this.needBrbcApprove$.next(brbcAllowance.lt(Web3Pure.toWei(this.maxEnterAmount)));
        this.needUsdcApprove$.next(usdcAllowance.lt(Web3Pure.toWei(this.maxEnterAmount)));
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

  public requestWithdraw(nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'requestWithdraw',
      [nftId]
    );
  }

  public withdraw(nftId: number): void {
    this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
      this.lpProvidingContract,
      LP_PROVIDING_CONTRACT_ABI,
      'claimRewards',
      [nftId]
    );
  }

  public stake(amount: BigNumber, period: number): Observable<BigNumber[]> {
    return from(
      this.web3PrivateService[this.blockchain].tryExecuteContractMethod(
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

  public async switchNetwork(): Promise<boolean> {
    return await this.walletConnectorService.switchChain(
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
    );
  }

  public checkAmountForErrors(amount: BigNumber, balance: BigNumber): LpError | null {
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
      return 1;
    }

    if (days < LiquidityPeriod.LONG && days >= LiquidityPeriod.AVERAGE) {
      return 0.85;
    }

    return 0.7;
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
    const [tokensInfo, tokensCollectedRewards, tokensRewardsToCollect] = Object.values(deposits);

    return tokensInfo.map((tokenInfo: TokenLp, i: string | number) => {
      const { startTime, deadline } = tokenInfo;
      const start = new Date(Number(startTime) * 1000);
      const period = Math.floor((Number(deadline) - Number(startTime)) / (3600 * 24));

      return {
        ...tokenInfo,
        USDCAmount: Web3Pure.fromWei(tokenInfo.USDCAmount),
        BRBCAmount: Web3Pure.fromWei(tokenInfo.BRBCAmount),
        collectedRewards: Web3Pure.fromWei(tokensCollectedRewards[i]),
        rewardsToCollect: Web3Pure.fromWei(tokensRewardsToCollect[i]),
        start,
        period
      };
    });
  }

  private parseApr(apr: string): number {
    return Number(apr) / Math.pow(10, 11);
  }
}
