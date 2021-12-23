import { Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, from, merge, Observable, of } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService } from '@taiga-ui/core';

import { AuthService } from '@app/core/services/auth/auth.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { catchError, filter, finalize, first, map, switchMap, take, tap } from 'rxjs/operators';
import { STAKING_CONTRACT_ABI } from '../constants/XBRBC_CONTRACT_ABI';
import { StakingApiService } from '@features/staking/services/staking-api.service';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapModalComponent } from '@features/staking/components/swap-modal/swap-modal.component';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicError } from '@core/errors/models/RubicError';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { TransactionReceipt } from 'web3-eth';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { PrivateBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/private-blockchain-adapter.service';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/BRIDGE_PROVIDER';
import { BridgeTrade } from '@features/bridge/models/BridgeTrade';
import { TOKEN_RANK } from '@shared/models/tokens/TOKEN_RANK';
import { BinancePolygonRubicBridgeProviderService } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-rubic-bridge-provider/binance-polygon-rubic-bridge-provider.service';
import { STAKING_CONTRACT_ADDRESS } from '@features/staking/constants/STAKING_CONTRACT_ADDRESS';
import { EthereumBinanceRubicBridgeProviderService } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';

@Injectable()
export class StakingService {
  private walletAddress: string;

  private readonly stakingContractAddress = STAKING_CONTRACT_ADDRESS;
  // ? '0xc7FC65d50AfFBF2f32236eDc5217A916614e1F9d' //testnet xBRBC
  // : '0x0d0Ed1E7994a3926644cac9b296B3745315700ff'; // mainnet xBRBC

  private bridgeContractAddress: string;

  private readonly _amountWithRewards$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private readonly _apr$ = new BehaviorSubject<number>(0);

  private readonly _refillTime$ = new BehaviorSubject<string>('');

  private readonly _userEnteredAmount$ = new BehaviorSubject<number>(0);

  private readonly _totalRBCEntered$ = new BehaviorSubject<number>(0);

  private readonly _stakingTokenBalance$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private readonly _earnedRewards$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  private readonly _selectedToken$ = new BehaviorSubject<MinimalToken>(undefined);

  private readonly _maxAmountForWithdraw$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  get selectedToken(): MinimalToken {
    return this._selectedToken$.getValue();
  }

  private readonly _usersTotalDeposit$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly stakingTokenBalance$ = this._stakingTokenBalance$.asObservable();

  public readonly apr$ = this._apr$.asObservable();

  public readonly refillTime$ = this._refillTime$.asObservable();

  public readonly userEnteredAmount$ = this._userEnteredAmount$.asObservable();

  public readonly totalRBCEntered$ = this._totalRBCEntered$.asObservable();

  public readonly amountWithRewards$ = this._amountWithRewards$.asObservable();

  public readonly earnedRewards$ = this._earnedRewards$.asObservable();

  public readonly stakingProgress$ = combineLatest([
    this._totalRBCEntered$,
    this._userEnteredAmount$
  ]).pipe(map(([totalRbcEntered, userEnteredAmount]) => ({ totalRbcEntered, userEnteredAmount })));

  public readonly needLogin$ = this.authService.getCurrentUser().pipe(map(user => !user?.address));

  public readonly stakingProgressLoading$ = new BehaviorSubject<boolean>(true);

  public readonly stakingStatisticsLoading$ = new BehaviorSubject<boolean>(false);

  private readonly updateTokenBalance$ = new BehaviorSubject<void>(null);

  public readonly selectedToken$ = this._selectedToken$.asObservable();

  public readonly maxAmountForWithdraw$ = this._maxAmountForWithdraw$.asObservable();

  public readonly selectedTokenBalance$ = combineLatest([
    this.selectedToken$,
    this.needLogin$,
    this.updateTokenBalance$.asObservable()
  ]).pipe(
    switchMap(([selectedToken, needLogin]) => {
      if (needLogin) {
        return of(new BigNumber(0));
      } else {
        return this.getSelectedTokenBalance(selectedToken);
      }
    })
  );

  constructor(
    private readonly web3PublicService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: PrivateBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly stakingApiService: StakingApiService,
    private readonly errorService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly testingModeService: UseTestingModeService,
    private readonly polygonBinanceBridge: BinancePolygonRubicBridgeProviderService,
    private readonly ethereumBinanceBridge: EthereumBinanceRubicBridgeProviderService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    forkJoin([this.getTotalRBCEntered(), this.getApr(), this.getRefillTime()]).subscribe(() => {
      this.stakingProgressLoading$.next(false);
    });

    this.authService
      .getCurrentUser()
      .pipe(
        filter(Boolean),
        tap(({ address }) => (this.walletAddress = address)),
        switchMap(() => {
          return forkJoin([
            this.getStakingTokenBalance().pipe(
              switchMap(stakingTokenBalance => this.getAmountWithRewards(stakingTokenBalance))
            ),
            this.getUserEnteredAmount(),
            this.getMaxAmountForWithdraw()
          ]);
        }),
        switchMap(([amountWithRewards]) => {
          return this.getEarnedRewards(amountWithRewards);
        })
      )
      .subscribe(() => this.stakingStatisticsLoading$.next(false));

    this.stakingApiService.getBridgeContractAddress().subscribe(address => {
      this.bridgeContractAddress = address;
    });
  }

  public setToken(token: MinimalToken): void {
    this._selectedToken$.next(token);
  }

  public enterStake(amount: BigNumber): Observable<TransactionReceipt | unknown> {
    const tokenBlockchain = this._selectedToken$.getValue().blockchain;
    const amountInWei = Number(EthLikeWeb3Public.toWei(amount, 18)).toLocaleString('fullwide', {
      useGrouping: false
    });
    const needSwap =
      tokenBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET &&
      tokenBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    if (needSwap) {
      return this.openSwapModal(amount, tokenBlockchain);
    } else {
      return from(
        this.web3PrivateService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].tryExecuteContractMethod(
          this.stakingContractAddress,
          STAKING_CONTRACT_ABI,
          'enter',
          [amountInWei]
        )
      ).pipe(
        catchError((err: unknown) => {
          console.debug('enter stake error');
          this.errorService.catchAnyError(err as Error);
          return EMPTY;
        }),
        switchMap(receipt => this.updateUsersDeposit(amountInWei, receipt.transactionHash)),
        switchMap(() => {
          return forkJoin([this.reloadStakingStatistics(), this.reloadStakingProgress()]);
        }),
        tap(() => {
          this.updateTokenBalance$.next();
        })
      );
    }
  }

  public leaveStake(amount: BigNumber): Observable<unknown> {
    const adjustedAmountInWei = Number(EthLikeWeb3Public.toWei(amount, 18)).toLocaleString(
      'fullwide',
      {
        useGrouping: false
      }
    );
    return from(
      this.web3PrivateService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].tryExecuteContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'leave',
        [EthLikeWeb3Public.toWei(amount, 18)]
      )
    ).pipe(
      switchMap(receipt =>
        this.updateUsersDepositAfterWithdraw(adjustedAmountInWei, receipt.transactionHash)
      ),
      switchMap(() =>
        forkJoin([
          this.reloadStakingStatistics(),
          this.reloadStakingProgress(),
          this.getMaxAmountForWithdraw()
        ])
      )
    );
  }

  public needApprove(amount: BigNumber): Observable<boolean> {
    return from(
      this.web3PublicService[this.selectedToken.blockchain].getAllowance({
        tokenAddress: this.selectedToken.address,
        ownerAddress: this.walletAddress,
        spenderAddress: this.stakingContractAddress
      })
    ).pipe(
      map(allowance => {
        return allowance.lt(EthLikeWeb3Public.fromWei(amount, 18));
      })
    );
  }

  public approveTokens(): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].approveTokens(
        this.selectedToken.address,
        this.stakingContractAddress,
        'infinity'
      )
    ).pipe(
      catchError((err: unknown) => {
        this.errorService.catch(err as RubicError<ERROR_TYPE.TEXT>);
        return EMPTY;
      })
    );
  }

  private approve(): Observable<TransactionReceipt> {
    return from(
      this.web3PrivateService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].approveTokens(
        this.selectedToken.address,
        this.stakingContractAddress,
        'infinity'
      )
    );
  }

  public getSelectedTokenBalance(token: MinimalToken): Observable<BigNumber> {
    return from(
      this.web3PublicService[token.blockchain].getTokenBalance(this.walletAddress, token.address)
    ).pipe(
      catchError((err: unknown) => {
        this.errorService.catch(err as RubicError<ERROR_TYPE.TEXT>);
        return EMPTY;
      }),
      map(balance => EthLikeWeb3Public.fromWei(balance, 18))
    );
  }

  public getStakingTokenBalance(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].getTokenBalance(
        this.walletAddress,
        this.stakingContractAddress
      )
    ).pipe(
      catchError((error: unknown) => {
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber('0'));
      }),
      tap(balance => {
        this._stakingTokenBalance$.next(EthLikeWeb3Public.fromWei(balance, 18));
      })
    );
  }

  public getMaxAmountForWithdraw(): Observable<BigNumber> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'actualBalanceOf',
        {
          methodArguments: [this.walletAddress],
          from: this.walletAddress
        }
      )
    ).pipe(
      map(actualBalance => EthLikeWeb3Public.fromWei(actualBalance, 18)),
      tap(actualBalance => this._maxAmountForWithdraw$.next(actualBalance))
    );
  }

  private getAmountWithRewards(stakingTokenBalance?: BigNumber): Observable<BigNumber> {
    const balance = stakingTokenBalance || this._stakingTokenBalance$.getValue();
    return this.calculateLeaveReward(balance).pipe(
      catchError((error: unknown) => {
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return of(new BigNumber(0));
      }),
      tap(actualBalance => {
        this._amountWithRewards$.next(actualBalance);
      })
    );
  }

  private getEarnedRewards(amountWithRewards?: BigNumber): Observable<BigNumber> {
    return combineLatest([
      this.getUsersDeposit(),
      amountWithRewards ? of(amountWithRewards) : this._amountWithRewards$
    ]).pipe(
      first(),
      map(([usersDeposit, totalAmount]) => {
        const usersDepositInTokens = EthLikeWeb3Public.fromWei(usersDeposit, 18);
        const earnedRewards = totalAmount.minus(usersDepositInTokens);
        if (earnedRewards.s === -1 || earnedRewards.s === null) {
          return new BigNumber(0);
        }
        return earnedRewards;
      }),
      tap(earnedRewards => this._earnedRewards$.next(earnedRewards))
    );
  }

  public reloadStakingStatistics(): Observable<(number | BigNumber)[]> {
    this.stakingStatisticsLoading$.next(true);
    return this.getStakingTokenBalance().pipe(
      switchMap(stakingTokenBalance => {
        return this.getAmountWithRewards(stakingTokenBalance);
      }),
      switchMap(() => {
        return forkJoin([this.getEarnedRewards(), this.getApr()]);
      }),
      finalize(() => this.stakingStatisticsLoading$.next(false))
    );
  }

  private getUserEnteredAmount(): Observable<number> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'userEnteredAmount',
        {
          methodArguments: [this.walletAddress]
        }
      )
    ).pipe(
      catchError((error: unknown) => {
        console.debug('user entered amount');
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return EMPTY;
      }),
      map(amount => EthLikeWeb3Public.fromWei(amount, 18).toNumber()),
      tap(userEnteredAmount => this._userEnteredAmount$.next(userEnteredAmount))
    );
  }

  public getTotalRBCEntered(): Observable<string> {
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'totalRBCEntered'
      )
    ).pipe(
      catchError((error: unknown) => {
        console.debug('get total rbc entered');
        this.errorService.catch(error as RubicError<ERROR_TYPE.TEXT>);
        return EMPTY;
      }),
      tap(totalRbcEntered =>
        this._totalRBCEntered$.next(EthLikeWeb3Public.fromWei(+totalRbcEntered, 18).toNumber())
      )
    );
  }

  public reloadStakingProgress(): Observable<string | number> {
    this.stakingProgressLoading$.next(true);
    return this.needLogin$.pipe(
      take(1),
      switchMap(needLogin => {
        if (needLogin) {
          return this.getTotalRBCEntered();
        } else {
          return merge(this.getTotalRBCEntered(), this.getUserEnteredAmount());
        }
      }),
      finalize(() => this.stakingProgressLoading$.next(false))
    );
  }

  private getApr(): Observable<number> {
    return this.stakingApiService.getApr().pipe(
      catchError((err: unknown) => {
        console.debug(err);
        return EMPTY;
      }),
      tap(apr => this._apr$.next(apr))
    );
  }

  private getRefillTime(): Observable<string> {
    return this.stakingApiService
      .getRefillTime()
      .pipe(tap(refillTime => this._refillTime$.next(refillTime)));
  }

  public calculateLeaveReward(amount: BigNumber): Observable<BigNumber> {
    if (amount.isZero()) {
      return of(new BigNumber(0));
    }
    return from(
      this.web3PublicService[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].callContractMethod(
        this.stakingContractAddress,
        STAKING_CONTRACT_ABI,
        'canReceive',
        { methodArguments: [amount], from: this.walletAddress }
      )
    ).pipe(
      catchError(() => {
        return EMPTY;
      }),
      map(res => {
        return EthLikeWeb3Public.fromWei(res, 18);
      })
    );
  }

  private getUsersDeposit(): Observable<number> {
    return this.stakingApiService
      .getUsersDeposit(this.walletAddress)
      .pipe(tap(deposit => this._usersTotalDeposit$.next(new BigNumber(deposit))));
  }

  private updateUsersDeposit(amount: string, txHash: string): Observable<void> {
    return this.stakingApiService.updateUsersDeposit({
      walletAddress: this.walletAddress,
      amount,
      txHash,
      network: 'binance-smart-chain'
    });
  }

  private updateUsersDepositAfterWithdraw(amount: string, txHash: string): Observable<void> {
    return this.stakingApiService.updateUsersDepositAfterWithdraw({
      walletAddress: this.walletAddress,
      amount,
      txHash,
      network: 'binance-smart-chain'
    });
  }

  private openSwapModal(amount: BigNumber, blockchain: BLOCKCHAIN_NAME): Observable<unknown> {
    return this.dialogService.open(new PolymorpheusComponent(SwapModalComponent, this.injector), {
      size: 'l',
      data: { amount, blockchain }
    });
  }

  public enterStakeViaBridge(amount: BigNumber): Observable<TransactionReceipt> {
    const fromBlockchain = this._selectedToken$.getValue().blockchain;
    const bridgeTrade = this.getBridgeTradeObject(fromBlockchain, amount);

    return this.getRubicBridge(fromBlockchain).createTrade(bridgeTrade);
  }

  public needBridgeApprove(amount: BigNumber): Observable<boolean> {
    const fromBlockchain = this._selectedToken$.getValue().blockchain;
    const bridgeTrade = this.getBridgeTradeObject(fromBlockchain, amount);

    return this.getRubicBridge(fromBlockchain).needApprove(bridgeTrade);
  }

  public approveBridgeTokens(amount: BigNumber): Observable<TransactionReceipt> {
    const fromBlockchain = this._selectedToken$.getValue().blockchain;
    const bridgeTrade = this.getBridgeTradeObject(fromBlockchain, amount);

    return this.getRubicBridge(fromBlockchain).approve(bridgeTrade);
  }

  private getBridgeTradeObject(fromBlockchain: BLOCKCHAIN_NAME, amount: BigNumber): BridgeTrade {
    switch (fromBlockchain) {
      case BLOCKCHAIN_NAME.POLYGON:
        return {
          provider: BRIDGE_PROVIDER.SWAP_RBC,
          token: {
            symbol: 'RBC',
            image: 'assets/images/icons/staking/rbc-pos.svg',
            rank: TOKEN_RANK.HIGH,
            tokenByBlockchain: {
              [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
                blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
                address: '0x8E3BCC334657560253B83f08331d85267316e08a',
                name: 'BRBC',
                symbol: 'BRBC',
                decimals: 18,

                minAmount: 100,
                maxAmount: 100000
              },
              [BLOCKCHAIN_NAME.POLYGON]: {
                blockchain: BLOCKCHAIN_NAME.POLYGON,
                address: '0xc3cFFDAf8F3fdF07da6D5e3A89B8723D5E385ff8',
                name: 'Rubic (pos)',
                symbol: 'RBC',
                decimals: 18,

                minAmount: 100,
                maxAmount: 100100
              }
            }
          },
          fromBlockchain,
          toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
          amount,
          toAddress: this.bridgeContractAddress,
          onTransactionHash: async (txHash: string) => {
            await this.stakingApiService
              .sendBridgeTxHash({ txHash, network: 'polygon' })
              .toPromise();
          }
        };
      case BLOCKCHAIN_NAME.ETHEREUM:
        return {
          provider: BRIDGE_PROVIDER.SWAP_RBC,
          token: {
            symbol: 'RBC',
            image: 'assets/images/icons/staking/rbc-eth.svg',
            rank: TOKEN_RANK.HIGH,
            tokenByBlockchain: {
              [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
                blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
                address: '0x8E3BCC334657560253B83f08331d85267316e08a',
                name: 'BRBC',
                symbol: 'BRBC',
                decimals: 18,

                minAmount: 200,
                maxAmount: 100000
              },
              [BLOCKCHAIN_NAME.ETHEREUM]: {
                blockchain: BLOCKCHAIN_NAME.ETHEREUM,
                address: '0xA4EED63db85311E22dF4473f87CcfC3DaDCFA3E3',
                name: 'Rubic',
                symbol: 'RBC',
                decimals: 18,

                minAmount: 200,
                maxAmount: 100100
              }
            }
          },
          fromBlockchain,
          toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
          amount,
          toAddress: this.bridgeContractAddress,
          onTransactionHash: async (txHash: string) => {
            await this.stakingApiService
              .sendBridgeTxHash({ txHash, network: 'ethereum' })
              .toPromise();
          }
        };
    }
  }

  private getRubicBridge(
    blockchain: BLOCKCHAIN_NAME
  ): BinancePolygonRubicBridgeProviderService | EthereumBinanceRubicBridgeProviderService {
    if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
      return this.polygonBinanceBridge;
    } else if (blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      return this.ethereumBinanceBridge;
    }
  }

  public reloadStakingInfo(): void {
    forkJoin([this.getUserEnteredAmount(), this.getTotalRBCEntered()]);
  }
}
