import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import {
  emporiumOp,
  generateFundApproveAndTransactOps,
  getNecessaryAssetsForFunding,
  networkRegistry,
  SubAccount,
  TokenChanges,
  UserKeys,
  WRAPPER_TOKEN_EXCHANGE_ADDRESSES
} from '@hinkal/common';
import { blockchainId, EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { HinkalUtils } from './utils/hinkal-utils';
import { ErrorsService } from '@app/core/errors/errors.service';
import { HinkalQuoteService } from '../hinkal-quote.service';
import { HinkalWorkerService } from './hinkal-worker.service';

@Injectable()
export class HinkalSwapService {
  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly errorService: ErrorsService,
    private readonly hinkalQuoteService: HinkalQuoteService,
    private readonly hinkalWorker: HinkalWorkerService
  ) {}

  private getPrivateTxContract(chainId: number): string {
    return networkRegistry[chainId].contractData.emporiumAddress;
  }

  private async refreshAndUpdateSnapshot(chainId: number): Promise<void> {
    try {
      await this.hinkalWorker.request({ type: 'refreshStoredSnapshot' });
      await HinkalUtils.updateSnapshot(this.hinkalInstanceService.hinkalInstance, chainId);
      await this.hinkalInstanceService.hinkalInstance.resetMerkleTreesIfNecessary();
    } catch (err) {
      console.log('FAILED TO REFRESH SNAPSHOT', err);
    }
  }

  public async deposit(token: TokenAmount<EvmBlockchainName>): Promise<boolean> {
    try {
      this.refreshAndUpdateSnapshot(blockchainId[token.blockchain]);
      const depositToken = HinkalUtils.convertRubicTokenToHinkalToken(token);
      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;

      await hinkalInstance.deposit([depositToken], [BigInt(token.stringWeiAmount)]);

      hinkalInstance.snapshotsClearInterval();

      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async withdraw(
    token: TokenAmount<EvmBlockchainName>,
    _receiver?: string
  ): Promise<boolean> {
    try {
      const resp = await this.hinkalWorker.request({
        type: 'withdraw',
        token
      });
      console.log(resp);
      // await this.refreshAndUpdateSnapshot(blockchainId[token.blockchain]);

      // const hinkalInstance = this.hinkalInstanceService.hinkalInstance;
      // const withdrawToken = HinkalUtils.convertRubicTokenToHinkalToken(token);
      // const receiverAddress = receiver || (await hinkalInstance.getEthereumAddress());

      // await hinkalInstance.withdraw(
      //   [withdrawToken],
      //   [-BigInt(token.stringWeiAmount)],
      //   receiverAddress,
      //   false,
      //   undefined,
      //   undefined,
      //   undefined,
      //   false
      // );

      // hinkalInstance.snapshotsClearInterval();

      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async privateTransfer(
    token: TokenAmount<EvmBlockchainName>,
    recipientStealthAddress: string
  ): Promise<boolean> {
    try {
      await this.refreshAndUpdateSnapshot(blockchainId[token.blockchain]);
      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;
      const transferToken = HinkalUtils.convertRubicTokenToHinkalToken(token);

      await hinkalInstance.transfer(
        [transferToken],
        [-BigInt(token.stringWeiAmount)],
        recipientStealthAddress,
        undefined,
        undefined,
        undefined,
        false
      );

      hinkalInstance.snapshotsClearInterval();

      return true;
    } catch (err) {
      this.errorService.catch(err);
      return false;
    }
  }

  public async privateSwap(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>
  ): Promise<boolean> {
    try {
      if (fromToken.blockchain !== toToken.blockchain)
        throw new Error('Cross-chain swaps not supported');

      await this.refreshAndUpdateSnapshot(blockchainId[fromToken.blockchain]);

      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;
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

      const rubicSwapData = await this.hinkalQuoteService.fetchSwapData(fromAddress, receiver);

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

      // await hinkalInstance.actionFundApproveAndTransact(
      //   [fromTokenChanges, toTokenChanges],
      //   subAccount,
      //   rubicSwapData.to,
      //   rubicSwapData.to,
      //   rubicSwapData.data,
      //   BigInt(rubicSwapData.value),
      //   undefined,
      //   undefined,
      //   true,
      //   undefined,
      //   undefined,
      //   false
      // );

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

      await hinkalInstance.actionPrivateWallet(
        [fromHinkalToken.erc20TokenAddress, toHinkalToken.erc20TokenAddress],
        [fromTokenChanges.amount, toTokenChanges.amount],
        [false, true],
        ops,
        [fromTokenChanges, toTokenChanges],
        subAccount,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        undefined,
        undefined,
        false
      );

      hinkalInstance.snapshotsClearInterval();

      return true;
    } catch (err) {
      console.log('FAILED TO SWAP', err);
      this.errorService.catch(err);
      return false;
    }
  }
}
