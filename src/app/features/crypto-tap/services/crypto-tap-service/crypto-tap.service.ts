import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable, of, throwError } from 'rxjs';

import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import BigNumber from 'bignumber.js';
import { TranslateService } from '@ngx-translate/core';
import { TransactionReceipt } from 'web3-eth';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import {
  ABI,
  contractAddressEthereum,
  contractAddressKovan
} from 'src/app/features/crypto-tap/constants/ETH_CONTRACT';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { CryptoTapTrade } from 'src/app/features/crypto-tap/models/CryptoTapTrade';
import { CryptoTapApiService } from 'src/app/core/services/backend/crypto-tap-api/crypto-tap-api.service';
import { CryptoTapFullPriceFeeInfo } from 'src/app/features/crypto-tap/models/CryptoTapFullPriceFeeInfo';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';

interface EstimatedAmountResponse {
  from_amount: number;
  to_amount: number;
  fee_amount: number;
}

@Injectable()
export class CryptoTapService {
  private _fullPriceFeeInfo$ = new BehaviorSubject<CryptoTapFullPriceFeeInfo>(null);

  private baseApiUrl = 'https://exchanger.rubic.exchange/api/v1/';

  private isTestingMode: boolean;

  private contractAddress: string;

  public get fullPriceFeeInfo$(): Observable<CryptoTapFullPriceFeeInfo> {
    return this._fullPriceFeeInfo$.asObservable();
  }

  constructor(
    private authService: AuthService,
    private cryptoTapFormService: CryptoTapFormService,
    private providerConnectorService: ProviderConnectorService,
    private httpService: HttpService,
    private web3PrivateService: Web3PrivateService,
    private web3PublicService: Web3PublicService,
    private cryptoTapApiService: CryptoTapApiService,
    private readonly translateService: TranslateService,
    private readonly errorService: ErrorsService,
    useTestingModeService: UseTestingModeService
  ) {
    this.contractAddress = contractAddressEthereum;

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
      if (isTestingMode) {
        this.baseApiUrl = 'https://devbnbexchange.mywish.io/api/v1/';
        this.contractAddress = contractAddressKovan;
      }
    });

    this.setBestRateInfo();
  }

  public setBestRateInfo() {
    const nativeDecimals = 18;
    forkJoin([
      this.httpService.get<EstimatedAmountResponse>(
        `estimate_amount/`,
        { fsym: 'ETH', tsym: 'BNB' },
        this.baseApiUrl
      ),
      this.httpService.get<EstimatedAmountResponse>(
        `estimate_amount/`,
        { fsym: 'ETH', tsym: 'MATIC' },
        this.baseApiUrl
      )
    ]).subscribe(([bscResponse, polygonResponse]) => {
      this._fullPriceFeeInfo$.next({
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new BigNumber(bscResponse.fee_amount).div(
          10 ** nativeDecimals
        ),
        [BLOCKCHAIN_NAME.POLYGON]: new BigNumber(polygonResponse.fee_amount).div(
          10 ** nativeDecimals
        )
      });
    });
  }

  public calculateTrade(): Observable<CryptoTapTrade> {
    const { fromToken, toToken } = this.cryptoTapFormService.commonTrade.controls.input.value;
    return this.httpService
      .get(`estimate_amount/`, { fsym: fromToken.symbol, tsym: toToken.symbol }, this.baseApiUrl)
      .pipe(
        map((response: EstimatedAmountResponse) => ({
          fromAmount: Web3Public.fromWei(response.from_amount, fromToken.decimals),
          toAmount: Web3Public.fromWei(response.to_amount, toToken.decimals),
          fee: Web3Public.fromWei(response.fee_amount, fromToken.decimals)
        }))
      );
  }

  private async checkBalance(token: TokenAmount, fromAmount: BigNumber): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    return web3Public.checkBalance(token, fromAmount, this.authService.user.address);
  }

  public createTrade(onTransactionHash: (hash: string) => void): Observable<TransactionReceipt> {
    this.providerConnectorService.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);

    const { fromToken, toToken } = this.cryptoTapFormService.commonTrade.controls.input.value;
    const { fromAmount } = this.cryptoTapFormService.commonTrade.controls.output.value;
    const toNetwork = toToken.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 3;

    return forkJoin([this.needApprove(fromAmount), this.checkBalance(fromToken, fromAmount)]).pipe(
      mergeMap(([needApprove]) => {
        if (needApprove) {
          console.error('You should call approve before call createTrade method');
          return throwError(new UndefinedError());
        }

        if (Web3Public.isNativeAddress(fromToken.address)) {
          const estimatedGas = '120000';
          return this.web3PrivateService.executeContractMethod(
            this.contractAddress,
            ABI,
            'deposit',
            [toNetwork],
            {
              value: Web3Public.toWei(fromAmount, fromToken.decimals),
              onTransactionHash,
              gas: estimatedGas
            }
          );
        }

        return this.web3PrivateService.executeContractMethod(
          this.contractAddress,
          ABI,
          'depositToken',
          [fromToken.address, toNetwork],
          {
            onTransactionHash
          }
        );
      }),
      tap((receipt: TransactionReceipt) => {
        this.cryptoTapApiService.notifyCryptoTapBot({
          fromToken,
          toToken,
          fromAmount: fromAmount.toFixed(),
          toAmount: this.cryptoTapFormService.commonTrade.controls.output.value.toAmount.toFixed(),
          walletAddress: this.authService.user.address,
          transactionHash: receipt.transactionHash
        });
      })
    );
  }

  public needApprove(fromAmount: BigNumber): Observable<boolean> {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    const userAddress = this.authService.user?.address;
    const { fromToken: token } = this.cryptoTapFormService.commonTrade.controls.input.value;

    const amountInWei = fromAmount.multipliedBy(10 ** token.decimals);
    if (Web3Public.isNativeAddress(token.address)) {
      return of(false);
    }
    return from(web3Public.getAllowance(token.address, userAddress, this.contractAddress)).pipe(
      map(allowance => amountInWei.gt(allowance))
    );
  }

  public approve(onTransactionHash: (hash: string) => void): Observable<TransactionReceipt> {
    const { fromToken: token } = this.cryptoTapFormService.commonTrade.controls.input.value;
    const { fromAmount } = this.cryptoTapFormService.commonTrade.controls.output.value;

    this.providerConnectorService.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);

    return forkJoin([this.needApprove(fromAmount), this.checkBalance(token, fromAmount)]).pipe(
      mergeMap(([needApprove]) => {
        if (!needApprove) {
          console.error('You should check needApprove before call approve method');
          return throwError(new UndefinedError());
        }

        return this.web3PrivateService.approveTokens(
          token.address,
          this.contractAddress,
          'infinity',
          { onTransactionHash }
        );
      })
    );
  }
}
