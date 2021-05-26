import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import InstantTradeService from '../InstantTradeService';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from '../../models/InstantTradeToken';
import InstantTrade from '../../models/InstantTrade';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { ErrorsService } from '../../../../../core/services/errors/errors.service';
import { OneinchQuoteError } from '../../../../../shared/models/errors/provider/OneinchQuoteError';

interface OneInchQuoteResponse {
  fromToken: object;
  toToken: object;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: unknown[];
  estimatedGas: string;
}

interface OneInchTokensResponse {
  tokens: {
    [key in string]: any;
  };
}

interface OneInchApproveResponse {
  address: string;
}

interface OneInchSwapResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

export class OneInchService extends InstantTradeService {
  static SLIPPAGE_PERCENT = '1'; // 1%

  private readonly oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  private supportedTokensAddresses: string[] = [];

  private tokensLoadingProcess: Promise<void>;

  protected apiBaseUrl: string;

  protected blockchain: BLOCKCHAIN_NAME;

  constructor(
    private httpClient: HttpClient,
    private coingeckoApiService: CoingeckoApiService,
    useTestingModeService: UseTestingModeService,
    protected readonly errorsService: ErrorsService
  ) {
    super(errorsService);

    useTestingModeService.isTestingMode.subscribe(value => (this.isTestingMode = value));
    setTimeout(() => this.loadSupportedTokens());
  }

  private loadSupportedTokens() {
    this.tokensLoadingProcess = new Promise<void>(resolve => {
      this.httpClient
        .get(`${this.apiBaseUrl}tokens`)
        .subscribe((response: OneInchTokensResponse) => {
          resolve();
          this.supportedTokensAddresses = Object.keys(response.tokens);
        });
    });
  }

  private loadApproveAddress(): Promise<string> {
    return this.httpClient
      .get(`${this.apiBaseUrl}approve/spender`)
      .pipe(map((response: OneInchApproveResponse) => response.address))
      .toPromise();
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade> {
    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      fromToken,
      toToken
    );

    if (!this.supportedTokensAddresses.length) {
      await this.tokensLoadingProcess;
    }

    if (
      !this.supportedTokensAddresses.includes(fromTokenAddress) ||
      !this.supportedTokensAddresses.includes(toTokenAddress)
    ) {
      console.error(`One inch not support ${fromToken.address} or ${toToken.address}`);
      return null;
    }

    const oneInchTrade: OneInchQuoteResponse = (await this.httpClient
      .get(`${this.apiBaseUrl}quote`, {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount: fromAmount.multipliedBy(10 ** fromToken.decimals).toFixed(0)
        }
      })
      .toPromise()) as OneInchQuoteResponse;

    if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
      this.errorsService.throw(new OneinchQuoteError());
    }

    // TODO: верменный фикс, потому что rpc binance сломалось

    let estimatedGas;
    let gasFeeInUsd;
    let gasFeeInEth;

    if (this.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
      estimatedGas = new BigNumber(oneInchTrade.estimatedGas);
      const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();

      gasFeeInUsd = await this.web3Public.getGasFee(estimatedGas, ethPrice);
      gasFeeInEth = await this.web3Public.getGasFee(estimatedGas, new BigNumber(1));
    } else {
      estimatedGas = new BigNumber(0);
      gasFeeInUsd = new BigNumber(0);
      gasFeeInEth = new BigNumber(0);
    }

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: new BigNumber(oneInchTrade.toTokenAmount).div(10 ** toToken.decimals)
      },
      estimatedGas,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    await this.checkSettings(this.blockchain);

    // TODO: верменный фикс, потому что rpc binance сломалось
    if (this.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
      await this.checkBalance(trade);
    }

    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      trade.from.token,
      trade.to.token
    );

    const fromAmount = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (fromTokenAddress !== this.oneInchNativeAddress) {
      const approveAddress = await this.loadApproveAddress();
      await this.provideAllowance(
        fromTokenAddress,
        new BigNumber(fromAmount),
        approveAddress,
        options.onApprove
      );
    }

    const oneInchTrade: OneInchSwapResponse = (await this.httpClient
      .get(`${this.apiBaseUrl}swap`, {
        params: {
          fromTokenAddress,
          toTokenAddress,
          amount: fromAmount,
          slippage: OneInchService.SLIPPAGE_PERCENT,
          fromAddress: this.providerConnectorService.address
        }
      })
      .toPromise()) as OneInchSwapResponse;

    const increasedGas = new BigNumber(oneInchTrade.tx.gas).multipliedBy(1.25).toFixed(0);

    if (fromTokenAddress !== this.oneInchNativeAddress) {
      await this.provideAllowance(
        trade.from.token.address,
        new BigNumber(fromAmount),
        oneInchTrade.tx.to,
        options.onApprove
      );

      return this.web3Private.sendTransaction(oneInchTrade.tx.to, '0', {
        onTransactionHash: options.onConfirm,
        data: oneInchTrade.tx.data,
        gas: increasedGas,
        gasPrice: oneInchTrade.tx.gasPrice
      });
    }

    return this.web3Private.sendTransaction(oneInchTrade.tx.to, fromAmount, {
      onTransactionHash: options.onConfirm,
      data: oneInchTrade.tx.data,
      gas: increasedGas,
      gasPrice: oneInchTrade.tx.gasPrice,
      inWei: true
    });
  }

  private getOneInchTokenSpecificAddresses(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): { fromTokenAddress: string; toTokenAddress: string } {
    const fromTokenAddress = this.web3Public.isNativeAddress(fromToken.address)
      ? this.oneInchNativeAddress
      : fromToken.address;
    const toTokenAddress = this.web3Public.isNativeAddress(toToken.address)
      ? this.oneInchNativeAddress
      : toToken.address;
    return { fromTokenAddress, toTokenAddress };
  }
}
