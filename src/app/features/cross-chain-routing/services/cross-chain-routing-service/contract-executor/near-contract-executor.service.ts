import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { RefFiFunctionCallOptions } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-function-calls';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import {
  NearTransaction,
  RefFinanceService
} from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';
import { tuiPure } from '@taiga-ui/cdk';
import { ContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { NearContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/near-contract-data';
import { CROSS_CHAIN_METHODS } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/cross-chain-methods';
import { ContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';

@Injectable({
  providedIn: 'root'
})
export class NearContractExecutorService {
  @tuiPure
  private get contract(): NearContractData {
    return this.contracts[BLOCKCHAIN_NAME.NEAR] as NearContractData;
  }

  private readonly contracts = this.contractsDataService.contracts;

  constructor(
    private readonly nearPrivateAdapter: NearWeb3PrivateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly refFinanceService: RefFinanceService,
    private readonly contractsDataService: ContractsDataService
  ) {}

  public async executeTrade(
    trade: CrossChainTrade,
    options: TransactionOptions,
    targetAddress: string
  ): Promise<string> {
    const transactions: NearTransaction[] = [];

    const tokenInAmountAbsolute = Web3Pure.toWei(trade.tokenInAmount, trade.tokenIn.decimals);

    const secondPath = this.contracts[trade.toBlockchain].getSecondPath(
      trade.toTrade,
      trade.toProviderIndex
    );

    const fromTransitTokenAmountMin =
      ContractExecutorFacadeService.calculateFromTransitTokenAmountMin(trade);
    const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
      fromTransitTokenAmountMin,
      this.contracts[trade.toBlockchain].transitToken.decimals
    );

    const tokenOutAmountMin = ContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const isToNative = trade.toTrade.to.token.address === 'near';

    const methodName = this.contracts[trade.toBlockchain]
      .getSwapToUserMethodSignature(trade.toProviderIndex, isToNative)
      .split('(')[0];

    const sourceParams = [
      {
        pool_id: this.refFinanceService.currentTradePool.id,
        token_in: trade.fromTrade.from.token.address,
        amount_in: tokenInAmountAbsolute,
        token_out: this.contract.transitToken.address,
        min_amount_out: fromTransitTokenAmountMinAbsolute
      }
    ];

    const targetParams = {
      secondPath: secondPath,
      min_amount_out: tokenOutAmountMinAbsolute,
      blockchain: this.contracts[trade.toBlockchain].numOfBlockchain,
      new_address: targetAddress,
      swap_to_crypto: isToNative,
      signature: CROSS_CHAIN_METHODS[methodName].slice(2)
    };

    const tokenInActions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: 'dev-1640771380774-77776523511109',
          amount: tokenInAmountAbsolute,
          msg: JSON.stringify({
            SwapTokensToOther: {
              swap_actions: sourceParams,
              swap_to_params: targetParams
            }
          })
        },
        gas: '150000000000000'
      }
    ];

    transactions.push({
      receiverId: trade.fromTrade.from.token.address,
      functionCalls: tokenInActions
    });

    await this.nearPrivateAdapter.executeMultipleTransactions(
      transactions,
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      tokenOutAmountMinAbsolute
    );

    options?.onTransactionHash('');

    return new Promise(resolve => {
      setTimeout(() => resolve(''), 2000);
    });
  }
}
