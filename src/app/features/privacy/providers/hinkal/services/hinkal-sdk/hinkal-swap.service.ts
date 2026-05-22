import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';

import { blockchainId, EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { HinkalWorkerService } from './hinkal-worker.service';
import {
  DepositParams,
  SwapParams,
  TransferParams,
  WithdrawParams
} from './workers/models/worker-params';
import { EvmTransactionConfig, GasPrice } from '@cryptorubic/web3';
import { HINKAL_CONTRACT_ADDRESS } from '../../constants/hinkal-contract-address';
import { ExternalActionId, FeeStructure, getFeeStructure } from '@hinkal/common';
import { EstimateFeeStructureParams } from './workers/models/estimate-fee-structure-params';
import { HINKAL_PRIVATE_OPERATION } from '../../constants/hinkal-private-operations';
import { GasService } from '@app/core/services/gas-service/gas.service';
import { InsufficientShieldedFundsError } from '@app/core/errors/models/common/insufficient-shielded-funds.error';

@Injectable()
export class HinkalSwapService {
  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly errorService: ErrorsService,
    private readonly hinkalWorker: HinkalWorkerService,
    private readonly gasService: GasService
  ) {}

  private async getGasPriceOptions(blockchain: EvmBlockchainName): Promise<GasPrice | null> {
    try {
      const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
        blockchain
      );

      return shouldCalculateGasPrice ? gasPriceOptions : null;
    } catch {
      return null;
    }
  }

  public async needApproveBeforeShield(token: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    if (token.isNative) return false;

    const adapter = this.adapterFactory.getAdapter(token.blockchain);

    return adapter.needApprove(
      token,
      HINKAL_CONTRACT_ADDRESS,
      adapter.signer.walletAddress,
      token.stringWeiAmount
    );
  }

  public async approveBeforeShield(token: TokenAmount<EvmBlockchainName>): Promise<void> {
    try {
      if (token.isNative) return;

      const adapter = this.adapterFactory.getAdapter(token.blockchain);

      const gasPriceOptions = await this.getGasPriceOptions(token.blockchain);

      await adapter.approveTokens(token.address, HINKAL_CONTRACT_ADDRESS, token.weiAmount, {
        gasPriceOptions
      });
    } catch (err) {
      console.error('APPROVE FAILED: ', err);
      throw err;
    }
  }

  public async deposit(token: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    try {
      const params: DepositParams = {
        token: {
          ...token,
          stringWeiAmount: token.stringWeiAmount,
          isNative: token.isNative
        }
      };

      const txData = await this.hinkalWorker.request<EvmTransactionConfig>({
        type: 'deposit',
        params
      });

      const adapter = this.adapterFactory.getAdapter(token.blockchain);

      const gasPriceOptions = await this.getGasPriceOptions(token.blockchain);

      await adapter.signer.trySendTransaction({
        txOptions: {
          ...txData,
          gasPriceOptions
        }
      });

      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async withdraw(
    token: TokenAmount<EvmBlockchainName>,
    feeToken: string,
    feeStructure: FeeStructure,
    receiver?: string
  ): Promise<boolean> {
    try {
      const params: WithdrawParams = {
        token: {
          ...token,
          stringWeiAmount: token.stringWeiAmount,
          isNative: token.isNative
        },
        receiver,
        feeToken,
        feeStructure
      };

      await this.hinkalWorker.request({
        type: 'withdraw',
        params
      });

      return true;
    } catch (err) {
      if ('message' in err && err.message?.includes('Insufficient funds')) {
        this.errorService.catch(new InsufficientShieldedFundsError());
      } else {
        this.errorService.catch(err);
      }

      return false;
    }
  }

  public async privateTransfer(
    token: TokenAmount<EvmBlockchainName>,
    recipientStealthAddress: string,
    feeToken: string
  ): Promise<boolean> {
    try {
      const params: TransferParams = {
        token: {
          ...token,
          stringWeiAmount: token.stringWeiAmount,
          isNative: token.isNative
        },
        receiver: recipientStealthAddress,
        feeToken
      };

      await this.hinkalWorker.request({
        type: 'transfer',
        params
      });

      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async privateSwap(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>,
    feeToken: string
  ): Promise<boolean> {
    try {
      if (fromToken.blockchain !== toToken.blockchain)
        throw new Error('Cross-chain swaps not supported');

      const params: SwapParams = {
        fromToken: {
          ...fromToken,
          stringWeiAmount: fromToken.stringWeiAmount,
          isNative: fromToken.isNative
        },
        toToken: {
          ...toToken,
          stringWeiAmount: toToken.stringWeiAmount,
          isNative: toToken.isNative
        },
        feeToken
      };

      await this.hinkalWorker.request({
        type: 'swap',
        params
      });

      return true;
    } catch (err) {
      console.log('FAILED TO SWAP', err);
      this.errorService.catch(err);
      return false;
    }
  }

  public async estimateFee(params: EstimateFeeStructureParams): Promise<FeeStructure> {
    const { operation, feeTokenAddress, fromToken } = params;

    const chainId = blockchainId[fromToken.blockchain];
    try {
      const isSwap = operation === HINKAL_PRIVATE_OPERATION.SWAP;

      const fee = await getFeeStructure(
        chainId,
        feeTokenAddress,
        [fromToken.address, ...(isSwap ? [params.toToken.address] : [])],
        isSwap ? ExternalActionId.Emporium : ExternalActionId.Transact
      );

      return fee;
    } catch {
      return {
        feeToken: params.feeTokenAddress,
        flatFee: 0n,
        variableRate: 0n
      };
    }
  }
}
