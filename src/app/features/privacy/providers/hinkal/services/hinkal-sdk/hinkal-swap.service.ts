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
import { PrivateActionRes } from '../../../shared-privacy-providers/components/private-preview-swap/models/preview-swap-options';
import { getScannerUrl } from '../../../privacycash/services/common/token-facades/utils/get-minimal-tokens-by-chain';

type TxHash = string;
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

  public async approveBeforeShield(
    token: TokenAmount<EvmBlockchainName>
  ): Promise<PrivateActionRes> {
    try {
      if (token.isNative) return;

      const adapter = this.adapterFactory.getAdapter(token.blockchain);

      const gasPriceOptions = await this.getGasPriceOptions(token.blockchain);

      await adapter.approveTokens(token.address, HINKAL_CONTRACT_ADDRESS, token.weiAmount, {
        gasPriceOptions,
        gasLimitRatio: 1.3
      });

      return {};
    } catch (err) {
      console.error('APPROVE FAILED: ', err);
      throw err;
    }
  }

  public async deposit(token: TokenAmount<EvmBlockchainName>): Promise<PrivateActionRes> {
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

      const txRes = await adapter.signer.trySendTransaction({
        txOptions: {
          ...txData,
          gasPriceOptions,
          gasLimitRatio: 1.3
        }
      });

      return { txScannerUrl: getScannerUrl(token, txRes.transactionHash) };
    } catch (err) {
      this.errorService.catch(err);
      throw err;
    }
  }

  public async withdraw(
    token: TokenAmount<EvmBlockchainName>,
    feeToken: string,
    feeStructure: FeeStructure,
    receiver?: string
  ): Promise<PrivateActionRes> {
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

      const txHash = await this.hinkalWorker.request<TxHash>({
        type: 'withdraw',
        params
      });

      return { txScannerUrl: getScannerUrl(token, txHash) };
    } catch (err) {
      this.errorService.catch(err);

      if ('message' in err && err.message?.includes('Insufficient funds')) {
        this.errorService.catch(new InsufficientShieldedFundsError());
      } else {
        this.errorService.catch(err);
      }

      throw err;
    }
  }

  public async privateTransfer(
    token: TokenAmount<EvmBlockchainName>,
    recipientStealthAddress: string,
    feeToken: string
  ): Promise<PrivateActionRes> {
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

      const txHash = await this.hinkalWorker.request<TxHash>({
        type: 'transfer',
        params
      });

      return { txScannerUrl: getScannerUrl(token, txHash) };
    } catch (err) {
      this.errorService.catch(err);
      throw err;
    }
  }

  public async privateSwap(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>,
    feeToken: string
  ): Promise<PrivateActionRes> {
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

      const txHash = await this.hinkalWorker.request<TxHash>({
        type: 'swap',
        params
      });

      return { txScannerUrl: getScannerUrl(fromToken, txHash) };
    } catch (err) {
      console.log('FAILED TO SWAP', err);
      this.errorService.catch(err);
      throw err;
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
