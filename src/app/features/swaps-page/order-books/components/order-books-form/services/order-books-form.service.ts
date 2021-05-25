import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { MetamaskError } from 'src/app/shared/models/errors/provider/MetamaskError';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { EMPTY_ADDRESS } from 'src/app/shared/constants/order-book/empty-address';
import { OrderBookTradeApi } from 'src/app/core/services/backend/order-book-api/types/trade-api';
import { TO_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { OrderBookFormToken, OrderBookTradeForm } from '../../../models/trade-form';
import { UseTestingModeService } from '../../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { SameTokensError } from '../../../../../../shared/models/errors/order-book/SameTokensError';
import { TotalSupplyOverflowError } from '../../../../../../shared/models/errors/order-book/TotalSupplyOverflowError';
import { BIG_NUMBER_FORMAT } from '../../../../../../shared/constants/formats/BIG_NUMBER_FORMAT';
import { ProviderConnectorService } from '../../../../../../core/services/blockchain/provider-connector/provider-connector.service';
import { ErrorsService } from '../../../../../../core/services/errors/errors.service';

@Injectable()
export class OrderBooksFormService implements OnDestroy {
  private readonly _tradeForm = new BehaviorSubject<OrderBookTradeForm>({
    token: {
      from: {} as OrderBookFormToken,
      to: {} as OrderBookFormToken
    }
  } as OrderBookTradeForm);

  private _useTestingModeSubscription$: Subscription;

  constructor(
    private orderBookApiService: OrderBookApiService,
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService,
    private useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly errorsService: ErrorsService
  ) {
    this._useTestingModeSubscription$ = useTestingModeService.isTestingMode.subscribe(
      isTestingMode => {
        if (isTestingMode) {
          ORDER_BOOK_CONTRACT.ADDRESSES[2][BLOCKCHAIN_NAME.ETHEREUM] =
            ORDER_BOOK_CONTRACT.ADDRESSES[2][BLOCKCHAIN_NAME.ETHEREUM_TESTNET];
          ORDER_BOOK_CONTRACT.ADDRESSES[2][BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN] =
            ORDER_BOOK_CONTRACT.ADDRESSES[2][BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET];
          ORDER_BOOK_CONTRACT.ADDRESSES[2][BLOCKCHAIN_NAME.POLYGON] =
            ORDER_BOOK_CONTRACT.ADDRESSES[2][BLOCKCHAIN_NAME.POLYGON_TESTNET];
        }
      }
    );
  }

  ngOnDestroy(): void {
    this._useTestingModeSubscription$.unsubscribe();
  }

  public getTradeForm(): Observable<OrderBookTradeForm> {
    return this._tradeForm.asObservable();
  }

  public setTradeForm(tradeForm: OrderBookTradeForm): void {
    return this._tradeForm.next(tradeForm);
  }

  private async checkSettings(tradeForm: OrderBookTradeForm): Promise<void> {
    if (!this.providerConnectorService.isProviderActive) {
      this.errorsService.throw(new MetamaskError());
    }

    if (!this.providerConnectorService.address) {
      this.errorsService.throw(new AccountError());
    }

    if (tradeForm.token.from.address.toLowerCase() === tradeForm.token.to.address.toLowerCase()) {
      this.errorsService.throw(new SameTokensError());
    }

    if (
      this.providerConnectorService.networkName !== tradeForm.blockchain &&
      this.providerConnectorService.networkName !== `${tradeForm.blockchain}_TESTNET`
    ) {
      this.errorsService.throw(new NetworkError(tradeForm.blockchain));
    }

    const web3Public: Web3Public = this.web3PublicService[tradeForm.blockchain];
    const fromToken = tradeForm.token.from;
    const fromTokenTotalSupply = Web3PublicService.tokenWeiToAmount(
      fromToken,
      (await web3Public.getTokenInfo(fromToken.address)).totalSupply
    );
    if (!fromTokenTotalSupply.isNaN() && fromTokenTotalSupply.lt(fromToken.amount)) {
      this.errorsService.throw(
        new TotalSupplyOverflowError(
          fromToken.symbol,
          fromTokenTotalSupply.toFormat(BIG_NUMBER_FORMAT)
        )
      );
    }

    const toToken = tradeForm.token.to;
    const toTokenTotalSupply = Web3PublicService.tokenWeiToAmount(
      toToken,
      (await web3Public.getTokenInfo(toToken.address)).totalSupply
    );
    if (!toTokenTotalSupply.isNaN() && toTokenTotalSupply.lt(toToken.amount)) {
      this.errorsService.throw(
        new TotalSupplyOverflowError(toToken.symbol, toTokenTotalSupply.toFormat(BIG_NUMBER_FORMAT))
      );
    }
  }

  /**
   * @description creates order book through smart contract and then makes post request to backend-api
   * @param tradeForm information about the trade
   * @param onTransactionHash callback to execute when transaction enters the mempool
   */
  public async createOrder(
    tradeForm: OrderBookTradeForm,
    onTransactionHash?: (hash: string) => void
  ): Promise<{
    transactionHash: string;
    uniqueLink: string;
  }> {
    await this.checkSettings(tradeForm);

    const web3Public: Web3Public = this.web3PublicService[tradeForm.blockchain];

    const contractAddress = ORDER_BOOK_CONTRACT.ADDRESSES[2][tradeForm.blockchain];
    const contractAbi = ORDER_BOOK_CONTRACT.ABI[2] as any[];

    const tradeApi = this.createTradeApiObject(tradeForm);

    const fee: string = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'feeAmount'
    );

    const createOrderArguments = [
      tradeApi.base_address,
      tradeApi.quote_address,
      tradeApi.base_limit,
      tradeApi.quote_limit,
      Math.round(new Date(tradeApi.stop_date).getTime() / 1000).toString(), // stop_date in seconds
      EMPTY_ADDRESS, // whitelist_address
      tradeApi.min_base_wei,
      tradeApi.min_quote_wei,
      tradeApi.broker_fee_address,
      tradeApi.broker_fee_base * 100,
      tradeApi.broker_fee_base * 100
    ];
    const receipt = await this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'createOrder',
      createOrderArguments,
      {
        value: fee,
        onTransactionHash
      }
    );

    tradeApi.memo = receipt.events.OrderCreated.returnValues.id;
    const { unique_link } = await this.orderBookApiService.createTrade(tradeApi);
    this.orderBookApiService.notifyOrderBooksBotOnCreate(
      tradeForm,
      unique_link,
      receipt.from,
      receipt.transactionHash
    );

    return {
      transactionHash: receipt.transactionHash,
      uniqueLink: unique_link
    };
  }

  private createTradeApiObject(tradeForm: OrderBookTradeForm): OrderBookTradeApi {
    return {
      memo: '',
      contract_address: ORDER_BOOK_CONTRACT.ADDRESSES[2][tradeForm.blockchain],
      base_address: tradeForm.token.from.address,
      quote_address: tradeForm.token.to.address,
      base_limit: Web3PublicService.tokenAmountToWei(
        tradeForm.token.from,
        tradeForm.token.from.amount
      ),
      quote_limit: Web3PublicService.tokenAmountToWei(
        tradeForm.token.to,
        tradeForm.token.to.amount
      ),
      stop_date: tradeForm.stopDate,
      public: tradeForm.isPublic,
      min_base_wei: Web3PublicService.tokenAmountToWei(
        tradeForm.token.from,
        tradeForm.token.from.minContribution
      ),
      min_quote_wei: Web3PublicService.tokenAmountToWei(
        tradeForm.token.to,
        tradeForm.token.to.minContribution
      ),
      base_amount_contributed: '0',
      quote_amount_contributed: '0',
      broker_fee: tradeForm.isWithBrokerFee,
      broker_fee_address: tradeForm.isWithBrokerFee ? tradeForm.brokerAddress : EMPTY_ADDRESS,
      broker_fee_base: parseFloat(tradeForm.token.from.brokerPercent),
      broker_fee_quote: parseFloat(tradeForm.token.to.brokerPercent),

      name: `${tradeForm.token.from.symbol} <> ${tradeForm.token.to.symbol}`,
      network: TO_BACKEND_BLOCKCHAINS[tradeForm.blockchain],
      state: 'ACTIVE',
      contract_state: 'ACTIVE',
      contract_type: 20,
      notification: false,
      permanent: false,
      is_rubic_order: true,
      rubic_initialized: true
    };
  }
}
