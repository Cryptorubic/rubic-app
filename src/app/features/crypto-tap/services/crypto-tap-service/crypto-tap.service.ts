import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { EMPTY, forkJoin, from, NEVER, Observable, of, throwError } from 'rxjs';

import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import InsufficientFundsError from 'src/app/shared/models/errors/instant-trade/InsufficientFundsError';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import BigNumber from 'bignumber.js';
import { TranslateService } from '@ngx-translate/core';
import { TransactionReceipt } from 'web3-eth';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { WalletError } from 'src/app/shared/models/errors/provider/WalletError';
import {
  ABI,
  contractAddressEthereum,
  contractAddressKovan
} from 'src/app/features/crypto-tap/constants/ETH_CONTRACT';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { CryptoTapTrade } from 'src/app/features/crypto-tap/models/CryptoTapTrade';
import { CryptoTapApiService } from 'src/app/core/services/backend/crypto-tap-api/crypto-tap-api.service';

interface EstimatedAmountResponse {
  from_amount: number;
  to_amount: number;
  fee_amount: number;
}

@Injectable()
export class CryptoTapService {
  private readonly baseApiUrl = 'https://exchanger.rubic.exchange/api/v1/';

  private isTestingMode: boolean;

  private contractAddress: string;

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
        this.contractAddress = contractAddressKovan;
      }
    });
  }

  public calculateTrade(): Observable<CryptoTapTrade> {
    const { fromToken, toToken } = this.cryptoTapFormService.commonTrade.controls.input.value;
    return this.httpService
      .get(`estimate_amount/`, { fsym: fromToken.symbol, tsym: toToken.symbol }, this.baseApiUrl)
      .pipe(
        map((response: EstimatedAmountResponse) => ({
          fromAmount: Web3PublicService.tokenWeiToAmount(
            fromToken,
            response.from_amount.toString()
          ),
          toAmount: Web3PublicService.tokenWeiToAmount(toToken, response.to_amount.toString()),
          fee: Web3PublicService.tokenWeiToAmount(fromToken, response.fee_amount.toString())
        }))
      );
  }

  private checkSettings(): boolean {
    const blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    if (!this.providerConnectorService.isProviderActive) {
      this.errorService.catch$(new WalletError());
      return false;
    }

    if (!this.authService.user?.address) {
      this.errorService.catch$(new AccountError());
      return false;
    }
    if (
      this.providerConnectorService.networkName !== blockchain &&
      (this.providerConnectorService.networkName !== `${blockchain}_TESTNET` || !this.isTestingMode)
    ) {
      this.errorService.catch$(new NetworkError(blockchain));
      return false;
    }

    return true;
  }

  private async checkBalance(token: TokenAmount, fromAmount: BigNumber): Promise<boolean> {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    const amountInWei = fromAmount.multipliedBy(10 ** token.decimals);

    if (web3Public.isNativeAddress(token.address)) {
      const balance = await web3Public.getBalance(this.authService.user.address, {
        inWei: true
      });
      if (balance.lt(amountInWei)) {
        const formattedBalance = web3Public.weiToEth(balance);
        this.errorService.catch$(
          new InsufficientFundsError(token.symbol, formattedBalance, fromAmount.toString())
        );
        return false;
      }
    } else {
      const tokensBalance = await web3Public.getTokenBalance(
        this.authService.user.address,
        token.address
      );
      if (tokensBalance.lt(amountInWei)) {
        const formattedTokensBalance = Web3PublicService.tokenWeiToAmount(
          token,
          tokensBalance
        ).toFixed();
        this.errorService.catch$(
          new InsufficientFundsError(token.symbol, formattedTokensBalance, fromAmount.toString())
        );
        return false;
      }
    }
    return true;
  }

  public createTrade(onTransactionHash: (hash: string) => void): Observable<TransactionReceipt> {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    if (!this.checkSettings()) {
      return NEVER;
    }

    const { fromToken, toToken, fromAmount } =
      this.cryptoTapFormService.commonTrade.controls.input.value;
    const toNetwork = toToken.blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? 1 : 3;

    return forkJoin([this.needApprove(), this.checkBalance(fromToken, fromAmount)]).pipe(
      mergeMap(([needApprove, enoughBalance]) => {
        if (!needApprove) {
          console.error('You should call approve before call createTrade method');
          return throwError(new RubicError());
        }

        if (!enoughBalance) {
          console.error('Not enough balance');
          return EMPTY;
        }

        if (web3Public.isNativeAddress(fromToken.address)) {
          const estimatedGas = '120000';
          return this.web3PrivateService.executeContractMethod(
            this.contractAddress,
            ABI,
            'deposit',
            [toNetwork],
            {
              value: Web3PublicService.tokenAmountToWei(fromToken, fromAmount),
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

  public needApprove(): Observable<boolean> {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    const userAddress = this.authService.user.address;
    const { fromToken: token, fromAmount } =
      this.cryptoTapFormService.commonTrade.controls.input.value;

    const amountInWei = fromAmount.multipliedBy(10 ** token.decimals);
    if (web3Public.isNativeAddress(token.address)) {
      return of(false);
    }
    return from(web3Public.getAllowance(token.address, userAddress, this.contractAddress)).pipe(
      map(allowance => amountInWei.gt(allowance))
    );
  }

  public approve(onTransactionHash: (hash: string) => void): Observable<TransactionReceipt> {
    const { fromToken: token, fromAmount } =
      this.cryptoTapFormService.commonTrade.controls.input.value;

    if (!this.checkSettings()) {
      return;
    }

    return forkJoin([this.needApprove(), this.checkBalance(token, fromAmount)]).pipe(
      mergeMap(([needApprove, enoughBalance]) => {
        if (!needApprove) {
          console.error('You should check needApprove before call approve method');
          return throwError(new RubicError());
        }

        if (!enoughBalance) {
          console.error('Not enough balance');
          return EMPTY;
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
