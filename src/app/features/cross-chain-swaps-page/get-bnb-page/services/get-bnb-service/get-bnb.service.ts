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
import { GetBnbToken } from 'src/app/features/cross-chain-swaps-page/get-bnb-page/models/GetBnbToken';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { ABI, contractAddressEthereum, contractAddressKovan } from './constants/ethContract';

interface EstimatedAmountResponse {
  from_amount: number;
  to_amount: number;
  fee_amount: number;
}

@Injectable()
export class GetBnbService {
  private readonly baseApiUrl = 'https://devbnbexchange.mywish.io/api/v1/';

  private isTestingMode: boolean;

  private contractAddress: string;

  constructor(
    private httpService: HttpService,
    private web3PrivateService: Web3PrivateService,
    private web3PublicService: Web3PublicService,
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

  public getEstimatedAmount(swapToken: SwapToken): Observable<GetBnbToken> {
    return this.httpService.get(`estimate_amount/${swapToken.symbol}/`, {}, this.baseApiUrl).pipe(
      map((response: EstimatedAmountResponse) => ({
        ...swapToken,
        fromAmount: Web3PublicService.tokenWeiToAmount(
          swapToken,
          response.from_amount.toString()
        ).toFixed(),
        toAmount: Web3PublicService.tokenWeiToAmount(
          swapToken,
          response.to_amount.toString()
        ).toFixed(),
        fee: Web3PublicService.tokenWeiToAmount(swapToken, response.fee_amount.toString()).toFixed()
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
    const token = trade.fromToken;
    const { fromAmount } = trade.fromToken;
    const amountIn = Web3PublicService.tokenAmountToWei(token, fromAmount);
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];

    if (web3Public.isNativeAddress(token.address)) {
      const balance = await web3Public.getBalance(this.web3PrivateService.address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = web3Public.weiToEth(balance);
        throw new InsufficientFundsError(token.symbol, formattedBalance, fromAmount.toString());
      }
    } else {
      const tokensBalance = await web3Public.getTokenBalance(
        this.web3PrivateService.address,
        token.address
      );
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = Web3PublicService.tokenWeiToAmount(
          token,
          tokensBalance
        ).toFixed();
        throw new InsufficientFundsError(
          token.symbol,
          formattedTokensBalance,
          fromAmount.toString()
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

    const token = trade.fromToken;
    const { fromAmount } = trade.fromToken;
    if (token.symbol === 'ETH') {
      const receipt = await this.web3PrivateService.executeContractMethod(
        this.contractAddress,
        ABI,
        'deposit',
        [],
        {
          value: Web3PublicService.tokenAmountToWei(token, fromAmount),
          onTransactionHash
        }
      );
      return receipt.transactionHash;
    }

    await this.provideAllowance(token, onTransactionHash);
    const receipt = await this.web3PrivateService.executeContractMethod(
      this.contractAddress,
      ABI,
      'depositToken',
      [token.address],
      {
        onTransactionHash
      }
    );
    return receipt.transactionHash;
  }

  private async provideAllowance(
    token: GetBnbToken,
    onTransactionHash: (hash: string) => void
  ): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    const allowance = await web3Public.getAllowance(
      token.address,
      this.web3PrivateService.address,
      this.contractAddress
    );
    const fromAmount = new BigNumber(Web3PublicService.tokenAmountToWei(token, token.fromAmount));
    if (fromAmount.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3PrivateService.approveTokens(
        token.address,
        this.contractAddress,
        uintInfinity,
        {
          onTransactionHash
        }
      );
    }
  }
}
