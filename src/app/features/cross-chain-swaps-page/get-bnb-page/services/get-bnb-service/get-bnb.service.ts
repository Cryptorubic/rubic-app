import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GetBnbTrade } from 'src/app/features/cross-chain-swaps-page/get-bnb-page/models/GetBnbTrade';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { MetamaskError } from 'src/app/shared/models/errors/provider/MetamaskError';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import InsufficientFundsError from 'src/app/shared/models/errors/instant-trade/InsufficientFundsError';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import BigNumber from 'bignumber.js';
import { ABI, contractAddress } from './constants/ethContract';

interface EstimatedAmountResponse {
  from_amount: number;
  to_amount: number;
}

@Injectable()
export class GetBnbService {
  private readonly baseApiUrl = 'https://devbnbexchange.mywish.io/api/v1/';

  private isTestingMode: boolean;

  constructor(
    private httpService: HttpService,
    private web3PrivateService: Web3PrivateService,
    private web3PublicService: Web3PublicService,
    useTestingModeService: UseTestingModeService
  ) {
    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
    });
  }

  public getEstimatedAmounts(trade: GetBnbTrade): Observable<GetBnbTrade> {
    return this.httpService
      .get(`estimate_amount/${trade.fromToken.symbol}/`, {}, this.baseApiUrl)
      .pipe(
        map((response: EstimatedAmountResponse) => ({
          ...trade,
          fromAmount: Web3PublicService.tokenWeiToAmount(
            trade.fromToken,
            response.from_amount.toString()
          ).toFixed(),
          toAmount: Web3PublicService.tokenWeiToAmount(
            trade.toToken,
            response.to_amount.toString()
          ).toFixed()
        }))
      );
  }

  private checkSettings() {
    const blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    if (!this.web3PrivateService.isProviderActive) {
      throw new MetamaskError();
    }

    if (!this.web3PrivateService.address) {
      throw new AccountError();
    }
    if (
      this.web3PrivateService.networkName !== blockchain &&
      (this.web3PrivateService.networkName !== `${blockchain}_TESTNET` || !this.isTestingMode)
    ) {
      throw new NetworkError(blockchain);
    }
  }

  protected async checkBalance(trade: GetBnbTrade): Promise<void> {
    const amountIn = Web3PublicService.tokenAmountToWei(trade.fromToken, trade.fromAmount);
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];

    if (web3Public.isNativeAddress(trade.fromToken.address)) {
      const balance = await web3Public.getBalance(this.web3PrivateService.address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = web3Public.weiToEth(balance);
        throw new InsufficientFundsError(
          trade.fromToken.symbol,
          formattedBalance,
          trade.fromAmount.toString()
        );
      }
    } else {
      const tokensBalance = await web3Public.getTokenBalance(
        this.web3PrivateService.address,
        trade.fromToken.address
      );
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance.div(10 ** trade.fromToken.decimals).toString();
        throw new InsufficientFundsError(
          trade.fromToken.symbol,
          formattedTokensBalance,
          trade.fromAmount.toString()
        );
      }
    }
  }

  public async createTrade(
    trade: GetBnbTrade,
    onTransactionHash: (hash: string) => void
  ): Promise<string> {
    this.checkSettings();
    await this.checkBalance(trade);

    if (trade.fromToken.symbol === 'ETH') {
      const receipt = await this.web3PrivateService.executeContractMethod(
        contractAddress,
        ABI,
        'deposit',
        [],
        {
          value: Web3PublicService.tokenAmountToWei(trade.fromToken, trade.fromAmount),
          onTransactionHash
        }
      );
      return receipt.transactionHash;
    }

    await this.provideAllowance(trade, onTransactionHash);
    const receipt = await this.web3PrivateService.executeContractMethod(
      contractAddress,
      ABI,
      'depositToken',
      [trade.fromToken.address],
      {
        onTransactionHash
      }
    );
    return receipt.transactionHash;
  }

  private async provideAllowance(trade: GetBnbTrade, onTransactionHash: (hash: string) => void) {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    const allowance = await web3Public.getAllowance(
      trade.fromToken.address,
      this.web3PrivateService.address,
      contractAddress
    );
    const fromAmount = new BigNumber(
      Web3PublicService.tokenAmountToWei(trade.fromToken, trade.fromAmount)
    );
    if (fromAmount.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3PrivateService.approveTokens(
        trade.fromToken.address,
        contractAddress,
        uintInfinity,
        {
          onTransactionHash
        }
      );
    }
  }
}
