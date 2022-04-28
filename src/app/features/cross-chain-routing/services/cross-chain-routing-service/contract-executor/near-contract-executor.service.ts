import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { RefFiFunctionCallOptions } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-function-calls';
import { RefFinanceService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { NearWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/near/near-web3-private.service';
import { tuiPure } from '@taiga-ui/cdk';
import { ContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { NearContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/near-contract-data';
import { CROSS_CHAIN_METHODS } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/cross-chain-methods';
import { ContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';
import {
  DEFAULT_CCR_CALL_GAS,
  ONE_YOCTO_NEAR,
  WRAP_NEAR_CONTRACT,
  WRAP_NEAR_DECIMALS
} from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { RefFinanceSwapService } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance-swap.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';

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
    private readonly refFinanceSwapService: RefFinanceSwapService,
    private readonly contractsDataService: ContractsDataService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {}

  public async executeTrade(
    trade: CrossChainTrade,
    options: TransactionOptions,
    targetAddress: string
  ): Promise<string> {
    const tokenInAmountAbsolute = Web3Pure.toWei(trade.tokenInAmount, trade.tokenIn.decimals);

    const secondPath = this.contracts[trade.toBlockchain].getSecondPath(
      trade.toTrade,
      trade.toProviderIndex,
      trade.fromBlockchain
    );

    const fromTransitTokenAmountMin =
      ContractExecutorFacadeService.calculateFromTransitTokenAmountMin(trade);
    const fromTransitTokenAmountMinAbsolute = Web3Pure.toWei(
      fromTransitTokenAmountMin,
      this.contracts[trade.fromBlockchain].transitToken.decimals
    );

    const tokenOutAmountMin = ContractExecutorFacadeService.calculateTokenOutAmountMin(trade);
    const tokenOutAmountMinAbsolute = Web3Pure.toWei(tokenOutAmountMin, trade.tokenOut.decimals);

    const toAdapter = this.publicBlockchainAdapterService[trade.toBlockchain];
    const isToNative = toAdapter.isNativeAddress(trade.tokenOut.address);

    const swapToUserMethodName = this.contracts[trade.toBlockchain].getSwapToUserMethodName(
      trade.toProviderIndex,
      isToNative
    );

    const fromTokenAddress =
      trade.tokenIn.address === NATIVE_NEAR_ADDRESS ? WRAP_NEAR_CONTRACT : trade.tokenIn.address;

    const targetParams = {
      second_path: secondPath,
      min_amount_out: tokenOutAmountMinAbsolute,
      blockchain: this.contracts[trade.toBlockchain].numOfBlockchain,
      new_address: targetAddress,
      swap_to_crypto: isToNative,
      signature: CROSS_CHAIN_METHODS[swapToUserMethodName].slice(2)
    };

    const routes = this.refFinanceService.refRoutes;
    const routeEstimate = Web3Pure.toWei(routes?.[0]?.estimate, WRAP_NEAR_DECIMALS);
    const tokenInActions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: this.contract.address,
          amount: tokenInAmountAbsolute,
          msg: JSON.stringify({
            ...(trade.fromTrade
              ? {
                  SwapTokensToOther: {
                    swap_actions:
                      routes.length > 1
                        ? [
                            {
                              pool_id: routes[0].pool.id,
                              token_in: fromTokenAddress,
                              amount_in: tokenInAmountAbsolute,
                              token_out: WRAP_NEAR_CONTRACT,
                              min_amount_out: routeEstimate
                            },
                            {
                              pool_id: routes[1].pool.id,
                              token_in: WRAP_NEAR_CONTRACT,
                              amount_in: routeEstimate,
                              token_out: this.contract.transitToken.address,
                              min_amount_out: fromTransitTokenAmountMinAbsolute
                            }
                          ]
                        : [
                            {
                              pool_id: routes[0].pool.id,
                              token_in: fromTokenAddress,
                              amount_in: tokenInAmountAbsolute,
                              token_out: this.contract.transitToken.address,
                              min_amount_out: fromTransitTokenAmountMinAbsolute
                            }
                          ],
                    swap_to_params: targetParams
                  }
                }
              : {
                  SwapTransferTokensToOther: {
                    swap_to_params: targetParams
                  }
                })
          })
        },
        gas: DEFAULT_CCR_CALL_GAS,
        amount: ONE_YOCTO_NEAR
      }
    ];

    const registerTokensTransactions =
      await this.refFinanceSwapService.createRegisterTokensTransactions(
        this.contract.transitToken.address,
        fromTokenAddress,
        routes,
        SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
      );
    const depositTransactions = await this.refFinanceSwapService.createDepositTransactions(
      trade.fromTrade
    );
    const ccrSwapTransaction = {
      receiverId: fromTokenAddress,
      functionCalls: tokenInActions
    };

    await this.nearPrivateAdapter.executeMultipleTransactions(
      [...registerTokensTransactions, ...depositTransactions, ccrSwapTransaction],
      'ccr',
      tokenOutAmountMinAbsolute
    );

    options?.onTransactionHash('');

    return new Promise(resolve => {
      setTimeout(() => resolve(''), 2000);
    });
  }
}
