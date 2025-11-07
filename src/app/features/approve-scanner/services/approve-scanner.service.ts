import { Inject, Injectable, Injector as AngularInjector, INJECTOR } from '@angular/core';
import { Blockchain, BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { BLOCKCHAIN_NAME, EvmBlockchainName, compareAddresses } from '@cryptorubic/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormControlType } from '@shared/models/utils/angular-forms-types';
import { SupportedBlockchain, supportedBlockchains } from '../constants/supported-blockchains';
import {
  BehaviorSubject,
  combineLatestWith,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subscription,
  switchMap
} from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpClient } from '@angular/common/http';
import { TuiNotification } from '@taiga-ui/core';
import { Cacheable } from 'ts-cacheable';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { TokensService } from '@core/services/tokens/tokens.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { catchError, distinctUntilChanged, filter, first, share, tap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { switchTap } from '@shared/utils/utils';
import { GasService } from '@core/services/gas-service/gas.service';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { tuiIsPresent } from '@taiga-ui/cdk';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { erc20TokenAbi, RubicSdkError, UserRejectError } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';

interface ApproveForm {
  blockchain: Blockchain;
}

export interface ApproveTransaction {
  hash: string;
  tokenAddress: string;
  spender: string;
  value: string;
  timeStamp: number;
  token?: TokenAmount;
}

interface ScannerResult {
  hash: string;
  functionName: string;
  to: string;
  input: string;
  timeStamp: number;
}

interface ScannerResponse {
  result: ScannerResult[] | string;
  status: string;
  message: string;
}

type ApproveFormControl = FormControlType<ApproveForm>;

@Injectable()
export class ApproveScannerService {
  private readonly _exceededLimits$ = new BehaviorSubject<boolean>(false);

  public readonly exceededLimits$ = this._exceededLimits$.asObservable();

  public readonly supportedBlockchains = Object.entries(BLOCKCHAINS)
    .filter(([blockchain]: [SupportedBlockchain, Blockchain]) =>
      supportedBlockchains.includes(blockchain)
    )
    .map(([_blockchain, meta]) => meta);

  private readonly defaultBlockchain =
    this.supportedBlockchains.find(
      blockchain =>
        blockchain.key === (this.walletConnectorService.network ?? BLOCKCHAIN_NAME.ETHEREUM)
    ) ?? BLOCKCHAINS.ETH;

  public readonly form = new FormGroup<ApproveFormControl>({
    blockchain: new FormControl(this.defaultBlockchain)
  });

  public readonly queryForm = new FormGroup({
    spender: new FormControl(''),
    token: new FormControl('')
  });

  public readonly selectedBlockchain$ = this.form.controls.blockchain.valueChanges.pipe(
    startWith(this.form.controls.blockchain.value),
    shareReplay(shareReplayConfig)
  );

  private readonly _refreshTable$ = new BehaviorSubject('');

  public readonly refreshTable$ = this._refreshTable$.asObservable();

  public readonly allApproves$ = this.selectedBlockchain$.pipe(
    startWith(this.defaultBlockchain),
    combineLatestWith(
      this.walletConnectorService.addressChange$.pipe(filter(address => address !== null)),
      this.refreshTable$
    ),
    distinctUntilChanged(),
    tap(() => {
      this.tableLoading = true;
      this.page = 0;
      this.tokenSearchQuery = '';
      this.spenderSearchQuery = '';
    }),
    switchMap(([blockchain, address, revokedAddress]) =>
      this.fetchTransactions(blockchain, address, revokedAddress)
    ),
    tap(() => (this.tableLoading = false))
  );

  private readonly _tableLoading$ = new BehaviorSubject<boolean>(true);

  private set tableLoading(value: boolean) {
    this._tableLoading$.next(value);
  }

  public readonly tableLoading$ = this._tableLoading$.asObservable();

  public set tokenSearchQuery(value: string) {
    this.queryForm.controls.token.patchValue(value);
  }

  public set spenderSearchQuery(value: string) {
    this.queryForm.controls.spender.patchValue(value);
  }

  private readonly _size$ = new BehaviorSubject(10);

  public readonly size$ = this._size$.asObservable();

  public set size(value: number) {
    this._size$.next(value);
  }

  private readonly _page$ = new BehaviorSubject(0);

  public readonly page$ = this._page$.asObservable();

  public set page(value: number) {
    this._page$.next(value);
  }

  public readonly visibleApproves$: Observable<ApproveTransaction[]> = this.allApproves$.pipe(
    combineLatestWith(this.page$, this.size$, this.queryForm.valueChanges.pipe(debounceTime(400))),
    debounceTime(0),
    map(([approves, page, size, query]) => {
      const tokenQuery = query.token.split(' ').join('');
      const spenderQuery = query.spender.split(' ').join('');
      if (tokenQuery || spenderQuery) {
        return approves.filter(approve => {
          const hasSpender = approve.spender.toLowerCase().includes(spenderQuery.toLowerCase());
          const hasToken =
            approve.token?.symbol.toLowerCase().includes(tokenQuery.toLowerCase()) ||
            approve.tokenAddress.toLowerCase().includes(tokenQuery.toLowerCase());
          return hasSpender && hasToken;
        });
      }
      const start = page * size;
      const end = start + size;

      return approves.filter((_, index) => index >= start && index < end);
    }),
    share()
  );

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpClient,
    @Inject(INJECTOR) private readonly injector: AngularInjector,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly gasService: GasService,
    private readonly sdkLegacyService: SdkLegacyService
  ) {
    this.visibleApproves$.subscribe();
  }

  @Cacheable({ maxAge: 120_000 })
  private fetchTransactions(
    blockchain: Blockchain,
    userAddress: string,
    _revokedAddress: string
  ): Observable<ApproveTransaction[]> {
    const blockchainAddressMapper: Record<SupportedBlockchain, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: `https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: `https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.POLYGON]: `https://api.polygonscan.com/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.ARBITRUM]: `https://api.arbiscan.io/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.OPTIMISM]: `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.FANTOM]: `https://api.ftmscan.com/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.AVALANCHE]: `https://api.snowtrace.io/api?module=account&action=txlist&address=${userAddress}`
    };
    return this.httpService
      .get<ScannerResponse>(blockchainAddressMapper[blockchain.key as SupportedBlockchain])
      .pipe(
        map(response => this.handleScannerResponse(response)),
        switchTap(() => this.tokensStoreService.tokens$.pipe(first(tuiIsPresent))),
        switchMap(approves => this.findTokensForApproves(approves)),
        switchMap(approves => this.fetchLastAllowance(approves, blockchain)),
        map(approves => approves.filter(approve => approve.value !== '0')),
        tap(() => this._exceededLimits$.next(false)),
        catchError(err => {
          if (err instanceof Error && err.message.includes('Exceed limits')) {
            this._exceededLimits$.next(true);
          }
          return of([]);
        })
      );
  }

  async revokeApprove(tokenAddress: string, spenderAddress: string): Promise<void> {
    const blockchain = this.form.controls.blockchain.value.key as EvmBlockchainName;
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(blockchain);
    let revokeProgressNotification: Subscription;

    const allowance = await adapter.client.getAllowance(
      tokenAddress,
      this.walletConnectorService.address,
      spenderAddress
    );
    if (allowance.allowanceWei.eq(0)) {
      throw new RubicSdkError('Approve already revoked, token has 0 allowance');
    }

    try {
      const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
        blockchain
      );
      await adapter.client.approveTokens(tokenAddress, spenderAddress, new BigNumber(0), {
        onTransactionHash: _hash => {
          revokeProgressNotification = this.showProgressNotification();
        },
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      });
      this.showSuccessNotification();
      this._refreshTable$.next(tokenAddress);
    } catch (err) {
      this.handleError(err);
    } finally {
      revokeProgressNotification?.unsubscribe();
    }
  }

  public showProgressNotification(): Subscription {
    return this.notificationsService.show(this.translateService.instant('Revoke in progress'), {
      status: TuiNotification.Info,
      autoClose: false,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show('Successful revoke', {
      status: TuiNotification.Success,
      autoClose: 10000,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public handleError(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let status: TuiNotification;

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('errors.userReject');
        status = TuiNotification.Error;
      } else {
        label = this.translateService.instant('errors.unknown');
        status = TuiNotification.Error;
      }

      this.notificationsService.show(label, {
        autoClose: 10000,
        status,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    }
  }

  private handleScannerResponse(_response: ScannerResponse): Omit<ApproveTransaction, 'token'>[] {
    // @TODO VIEM
    return [];
    // if (typeof response.result === 'string') {
    //   throw new Error('Exceed limits');
    // }
    // const approveTransactions = response.result
    //   .filter(tx => tx?.functionName.includes('approve'))
    //   .reverse();
    // const uniqueTokens = new Map<string, Omit<ApproveTransaction, 'token'>>();
    // approveTransactions.forEach(tx => {
    //   const decodedData = MethodDecoder.decodeMethod(
    //     ERC20_TOKEN_ABI.find(method => method.name === 'approve')!,
    //     tx.input
    //   );
    //   const spender = decodedData.params.find(param => param.name === '_spender')!.value;
    //   const value = decodedData.params.find(param => param.name === '_value')!.value;
    //
    //   const key = `${tx.to}${spender}`;
    //   if (!uniqueTokens.has(key)) {
    //     uniqueTokens.set(key, {
    //       hash: tx.hash,
    //       tokenAddress: tx.to,
    //       spender,
    //       value,
    //       timeStamp: tx.timeStamp * 1000
    //     });
    //   }
    // });
    // return Array.from(uniqueTokens.values());
  }

  private findTokensForApproves(
    sourceApproves: Omit<ApproveTransaction, 'token'>[]
  ): Observable<ApproveTransaction[]> {
    const approvesAddresses = sourceApproves.map(approve => approve.tokenAddress);
    const uniqueAddresses = Array.from(new Set(approvesAddresses));
    const tokensRequests = uniqueAddresses.map(address =>
      this.tokensService.findToken(
        {
          address,
          blockchain: this.form.controls.blockchain.value.key
        },
        true
      )
    );
    return forkJoin([of(sourceApproves), Promise.all(tokensRequests)]).pipe(
      map(([approves, tokens]) => {
        return approves.map(approve => ({
          ...approve,
          token: tokens.find(token => compareAddresses(token?.address, approve.tokenAddress))
        }));
      })
    );
  }

  private async fetchLastAllowance(
    approves: ApproveTransaction[],
    blockchain: Blockchain
  ): Promise<ApproveTransaction[]> {
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      blockchain.key as EvmBlockchainName
    );
    const allowances = await adapter.multicallContractsMethods<string>(
      erc20TokenAbi,
      approves.map(approve => ({
        contractAddress: approve.tokenAddress,
        methodsData: [
          {
            methodName: 'allowance',
            methodArguments: [this.walletConnectorService.address, approve.spender]
          }
        ]
      }))
    );
    return approves.map((approve, index) => ({
      ...approve,
      value: allowances[index]?.[0].success ? allowances[index][0].output : approve.value
    }));
  }
}
