import {
  emporiumOp,
  generateFundAndApproveOps,
  Hinkal,
  networkRegistry,
  SubAccount,
  TokenChanges,
  WRAPPER_TOKEN_EXCHANGE_ADDRESSES
} from '@hinkal/common';
import { PureTokenAmount } from '../models/worker-params';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import { HinkalUtils } from '../../utils/hinkal-utils';
import { ContractTransaction, ethers, Wallet } from 'ethers';
import { EvmTransactionConfig } from '@cryptorubic/web3';
import { HinkalWorkerQuoteService } from './hinkal-quote.service';

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
        false
      )) as ethers.TransactionResponse;

      console.log(resp);
      return resp.hash;
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

      const hash = await hinkalInstance.transfer(
        [transferToken],
        [-BigInt(token.stringWeiAmount)],
        recipientStealthAddress
      );

      return hash;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async privateSwap(
    fromToken: PureTokenAmount<EvmBlockchainName>,
    toToken: PureTokenAmount<EvmBlockchainName>
  ): Promise<string> {
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

      const hinkalShieldedSignerAddress = new Wallet(keys.getShieldedPrivateKey()).address;

      const ops = generateFundAndApproveOps(
        hinkalInstance,
        fromChainId,
        [fromToken.address],
        [BigInt(fromToken.stringWeiAmount)],
        fromToken.isNative ? [] : [fromToken.address],
        [BigInt(fromToken.stringWeiAmount)],
        hinkalShieldedSignerAddress,
        rubicSwapData.to
      );

      const registry = WRAPPER_TOKEN_EXCHANGE_ADDRESSES as Record<number, string>;

      ops.push(
        emporiumOp({
          contract: rubicSwapData.to,
          callDataString: rubicSwapData.data,
          value: BigInt(rubicSwapData.value),
          invokeWallet: true
        }),
        emporiumOp({
          contract: registry[fromChainId],
          func: 'withdrawBalanceDifference',
          args: [0n],
          invokeWallet: true
        })
      );

      const ethAddress = await hinkalInstance.getEthereumAddress();
      const subAccount: SubAccount = {
        index: 0,
        ethAddress: ethAddress,
        privateKey: keys.getShieldedPrivateKey(),
        name: '',
        createdAt: new Date().toISOString(),
        isHidden: false,
        isImported: false,
        iconIndex: 0,
        isFavorite: false
      };

      const hash = await hinkalInstance.actionPrivateWallet(
        fromChainId,
        [fromHinkalToken, toHinkalToken],
        [fromTokenChanges.amount, toTokenChanges.amount],
        [false, true],
        ops,
        [fromTokenChanges, toTokenChanges],
        subAccount
      );

      return hash;
    } catch (err) {
      console.log('FAILED TO SWAP', err);
      throw err;
    }
  }
}
