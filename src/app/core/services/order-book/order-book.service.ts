import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/IBlockchain';
import { OrderBookToken, TradeInfo, TradeInfoApi } from './types';
import { CONTRACT } from './smart-contract';
import { OrderBookApiService } from '../backend/order-book-api/order-book-api.service';
import { Web3Public } from '../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';

@Injectable({
  providedIn: 'root'
})
export class OrderBookService {
  private readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

  constructor(
    private orderBookApiService: OrderBookApiService,
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService
  ) {}

  private static tokenAmountToWei(token: OrderBookToken, amount: string): string {
    return new BigNumber(amount || '0').times(new BigNumber(10).pow(token.decimals)).toFixed(0);
  }

  /**
   * @description creates order book through smart contract and then makes post request to backend
   * @param tradeInfo information about the trade
   */
  public async createOrder(tradeInfo: TradeInfo): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[tradeInfo.blockchain];

    const contractAddress = CONTRACT.ADDRESSES[2][tradeInfo.blockchain];
    const contractAbi = CONTRACT.ABI[2] as any[];

    const fee = new BigNumber(
      await web3Public.callContractMethod(contractAddress, contractAbi, 'feeAmount').toString()
    );

    const tradeInfoApi = this.generateCreateSwapApiObject(tradeInfo);
    const args = await this.generateCreateOrderArguments(tradeInfoApi);
    const receipt = await this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'createOrder',
      args,
      {
        value: fee.toFixed(0)
      }
    );
    tradeInfoApi.memo_contract = receipt.events.OrderCreated.returnValues.id;

    await this.orderBookApiService.createTrade(tradeInfoApi);
  }

  private generateCreateSwapApiObject(tradeInfo: TradeInfo): TradeInfoApi {
    let network;
    switch (tradeInfo.blockchain) {
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
      contract_address: CONTRACT.ADDRESSES[2][tradeInfo.blockchain],
      base_address: tradeInfo.tokens.base.address,
      quote_address: tradeInfo.tokens.quote.address,
      base_limit: OrderBookService.tokenAmountToWei(
        tradeInfo.tokens.base,
        tradeInfo.tokens.base.amount
      ),
      quote_limit: OrderBookService.tokenAmountToWei(
        tradeInfo.tokens.quote,
        tradeInfo.tokens.quote.amount
      ),
      stop_date: tradeInfo.stopDate,
      public: tradeInfo.isPublic,
      min_base_wei: OrderBookService.tokenAmountToWei(
        tradeInfo.tokens.base,
        tradeInfo.tokens.base.minContribution
      ),
      min_quote_wei: OrderBookService.tokenAmountToWei(
        tradeInfo.tokens.quote,
        tradeInfo.tokens.quote.minContribution
      ),
      broker_fee: tradeInfo.isWithBrokerFee,
      broker_fee_address: tradeInfo.brokerAddress,
      broker_fee_base: parseInt(tradeInfo.tokens.base.brokerPercent, 10),
      broker_fee_quote: parseInt(tradeInfo.tokens.quote.brokerPercent, 10),

      name: `${tradeInfo.tokens.base.symbol} <> ${tradeInfo.tokens.quote.symbol}`,
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

  private generateCreateOrderArguments(tradeInfoApi: TradeInfoApi): any[] {
    const stopDate = Math.round(new Date(tradeInfoApi.stop_date).getTime() / 1000).toString();

    return [
      tradeInfoApi.base_address,
      tradeInfoApi.quote_address,
      tradeInfoApi.base_limit,
      tradeInfoApi.quote_limit,
      stopDate,
      this.EMPTY_ADDRESS, // whitelist_address
      tradeInfoApi.min_base_wei,
      tradeInfoApi.min_quote_wei,
      tradeInfoApi.broker_fee_address || this.EMPTY_ADDRESS,
      tradeInfoApi.broker_fee_base * 100,
      tradeInfoApi.broker_fee_base * 100
    ];
  }
}
