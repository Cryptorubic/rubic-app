import {
  emporiumOp,
  generateFundApproveAndTransactOps,
  getNecessaryAssetsForFunding,
  Hinkal,
  networkRegistry,
  RelayerTransaction,
  SubAccount,
  TokenChanges,
  UserKeys,
  WRAPPER_TOKEN_EXCHANGE_ADDRESSES
} from '@hinkal/common';
import { PureTokenAmount } from '../models/worker-params';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import { HinkalUtils } from '../../utils/hinkal-utils';
import { ContractTransaction } from 'ethers';
import { EvmTransactionConfig } from '@cryptorubic/web3';
import { HinkalWorkerQuoteService } from './hinkal-quote.service';
import BigNumber from 'bignumber.js';
import { Token } from '@app/shared/models/tokens/token';

export class HinkalWorkerSwapService {
  private readonly hinkal: Hinkal<unknown>;

  private readonly quoteService: HinkalWorkerQuoteService;

  constructor(hinkal: Hinkal<unknown>, quoteService: HinkalWorkerQuoteService) {
    this.hinkal = hinkal;
    this.quoteService = quoteService;
  }

  private getPrivateTxContract(chainId: number): string {
    return networkRegistry[chainId].contractData.emporiumAddress;
  }

  public async getGasPrice(): Promise<BigNumber> {
    try {
      const hinkalInstance = this.hinkal;
      const result = await hinkalInstance.getGasPrice();

      return new BigNumber(result.toString());
    } catch (err) {
      console.log('FAILED TO GET GAS PRICE', err);
      throw err;
    }
  }

  // public async estimateFee(params: EstimateFeeStructureParams): Promise<FeeStructure> {
  //   const { operation, fromToken, chainId, feeTokenAddress } = params;

  //   if (operation !== HINKAL_PRIVATE_OPERATION.SWAP) {
  //     return getFeeStructure(
  //       chainId,
  //       feeTokenAddress,
  //       [fromToken.address],
  //       ExternalActionId.Transact
  //     );
  //   }
  // }

  public async deposit(token: PureTokenAmount<EvmBlockchainName>): Promise<EvmTransactionConfig> {
    try {
      const depositToken = HinkalUtils.convertRubicTokenToHinkalToken(token);
      const hinkalInstance = this.hinkal;

      const resp = (await hinkalInstance.deposit(
        [depositToken],
        [BigInt(token.stringWeiAmount)],
        true,
        true
      )) as ContractTransaction;

      console.log(resp);

      return {
        data: resp.data,
        to: resp.to,
        value: String(resp.value || 0)
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async withdraw(
    token: PureTokenAmount<EvmBlockchainName>,
    receiver?: string
  ): Promise<string> {
    try {
      const hinkalInstance = this.hinkal;
      const withdrawToken = HinkalUtils.convertRubicTokenToHinkalToken(token);
      const receiverAddress = receiver || (await hinkalInstance.getEthereumAddress());

      const resp = (await hinkalInstance.withdraw(
        [withdrawToken],
        [-BigInt(token.stringWeiAmount)],
        receiverAddress,
        false,
        undefined,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;

      console.log(resp);
      return resp.transactionHash;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async privateTransfer(
    token: PureTokenAmount<EvmBlockchainName>,
    recipientStealthAddress: string
  ): Promise<string> {
    try {
      const hinkalInstance = this.hinkal;
      const transferToken = HinkalUtils.convertRubicTokenToHinkalToken(token);

      const resp = (await hinkalInstance.transfer(
        [transferToken],
        [-BigInt(token.stringWeiAmount)],
        recipientStealthAddress,
        undefined,
        undefined,
        undefined,
        false
      )) as RelayerTransaction;

      return resp.transactionHash;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async privateSwap(
    fromToken: PureTokenAmount<EvmBlockchainName>,
    toToken: PureTokenAmount<EvmBlockchainName>,
    feeToken?: Token,
    onlyGasEstimate?: boolean
  ): Promise<string | BigNumber> {
    try {
      if (fromToken.blockchain !== toToken.blockchain)
        throw new Error('Cross-chain swaps not supported');

      const hinkalInstance = this.hinkal;
      const fromChainId = blockchainId[fromToken.blockchain];

      const keys = hinkalInstance.userKeys;

      const fromHinkalToken = HinkalUtils.convertRubicTokenToHinkalToken(fromToken);
      const toHinkalToken = HinkalUtils.convertRubicTokenToHinkalToken(toToken);

      const fromTokenChanges: TokenChanges<bigint> = {
        token: fromHinkalToken,
        amount: -BigInt(fromToken.stringWeiAmount)
      };

      const toTokenChanges: TokenChanges<bigint> = {
        token: toHinkalToken,
        amount: BigInt(toToken.stringWeiAmount)
      };

      const fromAddress = this.getPrivateTxContract(fromChainId);
      const receiver = fromAddress;

      const rubicSwapData = await this.quoteService.fetchSwapData(fromAddress, receiver);

      const ethAddress = await hinkalInstance.getEthereumAddress();
      const subAccount: SubAccount = {
        index: 0,
        ethAddress: ethAddress,
        privateKey: keys.getShieldedPrivateKey(),
        name: 'user',
        createdAt: new Date().toISOString(),
        isHidden: false,
        isImported: false
      };

      const necessaryAssets = await getNecessaryAssetsForFunding(hinkalInstance, subAccount, [
        fromTokenChanges,
        toTokenChanges
      ]);

      const ops = generateFundApproveAndTransactOps(
        hinkalInstance,
        necessaryAssets.tokensToFund.map(token => token.erc20TokenAddress),
        necessaryAssets.fundAmounts,
        necessaryAssets.approveTokenAddresses,
        necessaryAssets.approvedTokenAmounts,
        UserKeys.getSignerAddressFromPrivateKey(fromChainId, keys.getShieldedPrivateKey()),
        rubicSwapData.to,
        rubicSwapData.to,
        rubicSwapData.data,
        BigInt(rubicSwapData.value)
      );

      ops.push(
        emporiumOp({
          contract: WRAPPER_TOKEN_EXCHANGE_ADDRESSES[fromChainId],
          func: 'withdrawBalanceDifference',
          args: [0n],
          invokeWallet: true
        })
      );

      const res = (await hinkalInstance.actionPrivateWallet(
        [fromHinkalToken.erc20TokenAddress, toHinkalToken.erc20TokenAddress],
        [fromTokenChanges.amount, toTokenChanges.amount],
        [false, true],
        ops,
        [fromTokenChanges, toTokenChanges],
        subAccount,
        feeToken?.address,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        onlyGasEstimate
      )) as RelayerTransaction | bigint;

      if (typeof res === 'bigint') return new BigNumber(res.toString());

      return res.transactionHash;
    } catch (err) {
      console.log('FAILED TO SWAP', err);
      throw err;
    }
  }
}
