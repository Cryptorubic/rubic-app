import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderBookTradeForm } from 'src/app/shared/models/order-book/trade-form';
import { OrderBookFormToken } from 'src/app/shared/models/order-book/tokens';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { OrderBookTradeApi } from 'src/app/shared/models/order-book/trade-api';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { MetamaskError } from 'src/app/shared/models/errors/provider/MetamaskError';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { EMPTY_ADDRESS } from '../../../../../shared/constants/order-book/empty-address';

@Injectable()
export class OrderBooksFormService {
  private readonly _tradeForm = new BehaviorSubject<OrderBookTradeForm>({
    token: {
      base: {} as OrderBookFormToken,
      quote: {} as OrderBookFormToken
    }
  } as OrderBookTradeForm);

  constructor(
    private orderBookApiService: OrderBookApiService,
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService
  ) {}

  public getTradeForm(): Observable<OrderBookTradeForm> {
    return this._tradeForm.asObservable();
  }

  public setTradeForm(tradeForm: OrderBookTradeForm): void {
    return this._tradeForm.next(tradeForm);
  }

  private checkSettings(selectedBlockchain: BLOCKCHAIN_NAME) {
    if (!this.web3PrivateService.isProviderActive) {
      throw new MetamaskError();
    }

    if (!this.web3PrivateService.address) {
      throw new AccountError();
    }

    if (
      this.web3PrivateService.networkName !== selectedBlockchain &&
      this.web3PrivateService.networkName !== `${selectedBlockchain}_TESTNET`
    ) {
      throw new NetworkError(selectedBlockchain);
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
  ): Promise<string> {
    this.checkSettings(tradeForm.blockchain);

    const web3Public: Web3Public = this.web3PublicService[tradeForm.blockchain];

    const contractAddress = ORDER_BOOK_CONTRACT.ADDRESSES[2][tradeForm.blockchain];
    const contractAbi = ORDER_BOOK_CONTRACT.ABI[2] as any[];

    const tradeApi = this.generateTradeApiObject(tradeForm);

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
    tradeApi.memo_contract = receipt.events.OrderCreated.returnValues.id;

    await this.orderBookApiService.createTrade(tradeApi);
    return receipt.transactionHash;
  }

  private generateTradeApiObject(tradeForm: OrderBookTradeForm): OrderBookTradeApi {
    let network;
    switch (tradeForm.blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        network = 1;
        break;
      case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
        network = 22;
        break;
      case BLOCKCHAIN_NAME.MATIC:
        network = 24;
      // no default
    }

    return {
      memo_contract: '',
      contract_address: ORDER_BOOK_CONTRACT.ADDRESSES[2][tradeForm.blockchain],
      base_address: tradeForm.token.base.address,
      quote_address: tradeForm.token.quote.address,
      base_limit: Web3PublicService.tokenAmountToWei(
        tradeForm.token.base,
        tradeForm.token.base.amount
      ),
      quote_limit: Web3PublicService.tokenAmountToWei(
        tradeForm.token.quote,
        tradeForm.token.quote.amount
      ),
      stop_date: tradeForm.stopDate,
      public: tradeForm.isPublic,
      min_base_wei: Web3PublicService.tokenAmountToWei(
        tradeForm.token.base,
        tradeForm.token.base.minContribution
      ),
      min_quote_wei: Web3PublicService.tokenAmountToWei(
        tradeForm.token.quote,
        tradeForm.token.quote.minContribution
      ),
      base_amount_contributed: '0',
      quote_amount_contributed: '0',
      broker_fee: tradeForm.isWithBrokerFee,
      broker_fee_address: tradeForm.isWithBrokerFee ? tradeForm.brokerAddress : EMPTY_ADDRESS,
      broker_fee_base: parseInt(tradeForm.token.base.brokerPercent),
      broker_fee_quote: parseInt(tradeForm.token.quote.brokerPercent),

      name: `${tradeForm.token.base.symbol} <> ${tradeForm.token.quote.symbol}`,
      network,
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
