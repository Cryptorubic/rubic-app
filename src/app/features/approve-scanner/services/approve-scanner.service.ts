import { Inject, Injectable, Injector as AngularInjector, INJECTOR } from '@angular/core';
import { Blockchain, BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import {
  BLOCKCHAIN_NAME,
  ERC20_TOKEN_ABI,
  MethodDecoder,
  Web3Pure,
  Injector,
  EvmBlockchainName,
  RubicSdkError,
  UserRejectError
} from 'rubic-sdk';
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
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RevokeModalComponent } from '@features/approve-scanner/components/revoke-modal/revoke-modal.component';
import { Cacheable } from 'ts-cacheable';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import BigNumber from 'bignumber.js';
import { TokenApproveData } from '@features/approve-scanner/models/token-approve-data';
import { TokensService } from '@core/services/tokens/tokens.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { catchError, distinctUntilChanged, first, share, tap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { switchTap } from '@shared/utils/utils';

interface ApproveForm {
  blockchain: Blockchain;
}

export interface ApproveTransaction {
  hash: string;
  tokenAddress: string;
  spender: string;
  value: string;
  timeStamp: number;
  token: TokenAmount;
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

  private readonly defaultBlockchain = this.supportedBlockchains.find(
    blockchain =>
      blockchain.key === (this.walletConnectorService.network ?? BLOCKCHAIN_NAME.ETHEREUM)
  );

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

  public readonly allApproves$ = this.selectedBlockchain$.pipe(
    startWith(this.defaultBlockchain),
    combineLatestWith(this.walletConnectorService.addressChange$),
    distinctUntilChanged(),
    tap(() => {
      this.tableLoading = true;
      this.page = 0;
      this.tokenSearchQuery = '';
      this.spenderSearchQuery = '';
    }),
    switchMap(([blockchain, address]) => this.fetchTransactions(blockchain, address)),
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
            approve.token.symbol.toLowerCase().includes(tokenQuery.toLowerCase()) ||
            approve.token.address.toLowerCase().includes(tokenQuery.toLowerCase());
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
    private readonly dialogService: TuiDialogService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService
  ) {
    this.visibleApproves$.subscribe();
  }

  @Cacheable({ maxAge: 120_000 })
  private fetchTransactions(
    blockchain: Blockchain,
    userAddress: string
  ): Observable<ApproveTransaction[]> {
    const blockchainAddressMapper: Record<SupportedBlockchain, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: `https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: `https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.POLYGON]: `https://api.polygonscan.com/api?module=account&action=txlist&address=${userAddress}`
    };
    return this.httpService
      .get<ScannerResponse>(blockchainAddressMapper[blockchain.key as SupportedBlockchain])
      .pipe(
        map(response => this.handleScannerResponse(response)),
        switchTap(() =>
          this.tokensService.tokens$.pipe(startWith(this.tokensService.tokens), first(Boolean))
        ),
        switchMap(approves => this.findTokensForApproves(approves)),
        tap(() => this._exceededLimits$.next(false)),
        catchError(err => {
          if (err instanceof Error && err.message.includes('Exceed limits')) {
            this._exceededLimits$.next(true);
          }
          return of([]);
        })
      );
  }

  public async showTokenModal(token: string, spender: string): Promise<void> {
    this.dialogService
      .open(new PolymorpheusComponent(RevokeModalComponent, this.injector), {
        size: 'm',
        data: {
          tokenAddress: token,
          spenderAddress: spender,
          blockchain: this.form.controls.blockchain.value.key
        }
      })
      .subscribe();
  }

  private searchStringInTable(
    approves: ApproveTransaction[],
    searchQuery: string
  ): ApproveTransaction[] {
    return searchQuery
      ? approves.filter(tx => {
          const spender = tx.spender.toLowerCase();
          const token = tx.tokenAddress.toLowerCase();
          const txHash = tx.hash.toLowerCase();
          const queryString = searchQuery.toLowerCase();

          return (
            spender.includes(queryString) ||
            token.includes(queryString) ||
            txHash.includes(queryString)
          );
        })
      : approves;
  }

  public async fetchApproveTokenData(
    tokenAddress: string,
    spenderAddress: string
  ): Promise<TokenApproveData> {
    try {
      const blockchain = this.form.controls.blockchain.value.key as EvmBlockchainName;
      const web3 = Injector.web3PublicService.getWeb3Public(blockchain);

      const { decimals, symbol } = await web3.callForTokenInfo(tokenAddress, [
        'decimals',
        'symbol'
      ]);

      const allowance = await web3.getAllowance(
        tokenAddress,
        this.walletConnectorService.address,
        spenderAddress
      );

      await new Promise(resolve => {
        setTimeout(resolve, 2_000);
      });
      const tokenDetails = await this.tokensService.findToken(
        { address: tokenAddress, blockchain: blockchain },
        true
      );
      const maxApprove = new BigNumber(2).pow(256).minus(1);

      return {
        address: tokenAddress,
        spender: spenderAddress,
        symbol,
        image: tokenDetails?.image || 'assets/images/icons/coins/default-token-ico.svg',
        allowance: maxApprove.eq(allowance)
          ? 'Infinity'
          : Web3Pure.fromWei(allowance, Number(decimals)).toFixed()
      };
    } catch {}
  }

  async revokeApprove(tokenAddress: string, spenderAddress: string): Promise<void> {
    const blockchain = this.form.controls.blockchain.value.key as EvmBlockchainName;
    const web3 = Injector.web3PublicService.getWeb3Public(blockchain);
    let revokeProgressNotification: Subscription;

    const allowance = await web3.getAllowance(
      tokenAddress,
      this.walletConnectorService.address,
      spenderAddress
    );
    if (allowance.eq(0)) {
      throw new RubicSdkError('Approve already revoked, token has 0 allowance');
    }

    try {
      await Injector.web3PrivateService
        .getWeb3PrivateByBlockchain(blockchain)
        .approveTokens(tokenAddress, spenderAddress, new BigNumber(0), {
          onTransactionHash: _hash => {
            revokeProgressNotification = this.showProgressNotification();
          }
        });
      this.showSuccessNotification();
    } catch (err) {
      this.handleError(err);
    } finally {
      revokeProgressNotification?.unsubscribe();
    }
  }

  public showProgressNotification(): Subscription {
    return this.notificationsService.show(this.translateService.instant('Revoke in progress'), {
      status: TuiNotification.Info,
      autoClose: false
    });
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show('Revoke is success.', {
      status: TuiNotification.Success,
      autoClose: 10000
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

      this.notificationsService.show(label, { autoClose: 10000, status });
    }
  }

  private handleScannerResponse(response: ScannerResponse): Omit<ApproveTransaction, 'token'>[] {
    if (response.status === '0' || typeof response.result === 'string') {
      throw new Error('Exceed limits');
    }
    const approveTransactions = response.result
      .filter(tx => tx?.functionName.includes('approve'))
      .reverse();
    return approveTransactions.map(tx => {
      const decodedData = MethodDecoder.decodeMethod(
        ERC20_TOKEN_ABI.find(method => method.name === 'approve')!,
        tx.input
      );
      const spender = decodedData.params.find(param => param.name === '_spender')!.value;
      const value = decodedData.params.find(param => param.name === '_value')!.value;
      return {
        hash: tx.hash,
        tokenAddress: tx.to,
        spender,
        value,
        timeStamp: tx.timeStamp * 1000
      };
    });
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
          token: tokens.find(token => token.address === approve.tokenAddress)
        }));
      })
    );
  }
}
