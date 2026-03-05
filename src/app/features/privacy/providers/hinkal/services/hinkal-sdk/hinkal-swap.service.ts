import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@app/core/services/sdk/sdk-legacy/blockchain-adapter-factory/blockchain-adapter-factory.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { networkRegistry } from '@hinkal/common';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { HinkalUtils } from './utils/hinkal-utils';
import { ErrorsService } from '@app/core/errors/errors.service';

@Injectable()
export class HinkalSwapService {
  constructor(
    private readonly adapterFactory: BlockchainAdapterFactoryService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly errorService: ErrorsService
  ) {}

  private getPrivateTxContract(chainId: number): string {
    return networkRegistry[chainId].contractData.emporiumAddress;
  }

  public async deposit(
    tokenAmount: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey?: string
  ): Promise<void> {
    try {
      const depositToken = HinkalUtils.convertRubicTokenToHinkalToken(tokenAmount);
      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;

      const deposit = await (receiverPrivateShieldedKey
        ? hinkalInstance.depositForOther(
            [depositToken],
            [BigInt(tokenAmount.stringWeiAmount)],
            HinkalUtils.getPrivateAddress(receiverPrivateShieldedKey)
          )
        : hinkalInstance.deposit([depositToken], [BigInt(tokenAmount.stringWeiAmount)]));

      const adapter = this.adapterFactory.getAdapter(tokenAmount.blockchain);

      await adapter.signer.trySendTransaction({
        txOptions: {
          data: deposit.data,
          to: deposit.to,
          value: deposit.value
        }
      });
    } catch (err) {
      this.errorService.catch(err);
    }
  }

  public async withdraw(token: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    try {
      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;
      const withdrawToken = HinkalUtils.convertRubicTokenToHinkalToken(token);
      const receiverAddress = receiver || (await hinkalInstance.getEthereumAddress());

      await hinkalInstance.withdraw(
        [withdrawToken],
        [-BigInt(token.stringWeiAmount)],
        receiverAddress,
        false,
        undefined,
        undefined,
        undefined,
        false
      );
    } catch (err) {
      this.errorService.catch(err);
    }
  }

  public async privateTransfer(
    token: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey: string
  ): Promise<void> {
    try {
      const hinkalInstance = this.hinkalInstanceService.hinkalInstance;
      const privateRecipientAddress = HinkalUtils.getPrivateAddress(receiverPrivateShieldedKey);
      const transferToken = HinkalUtils.convertRubicTokenToHinkalToken(token);

      await hinkalInstance.transfer(
        [transferToken],
        [-BigInt(token.stringWeiAmount)],
        privateRecipientAddress,
        undefined,
        undefined,
        undefined,
        false
      );
    } catch (err) {
      this.errorService.catch(err);
    }
  }

  // public async privateSwap(
  //   fromToken: TokenAmount<EvmBlockchainName>,
  //   toToken: TokenAmount<EvmBlockchainName>,
  // ): Promise<string> {
  //   try {

  //     const fromChainId = blockchainId[fromToken.blockchain];

  //     const keys = hinkalSdk.userKeys;

  //     const fromHinkalToken = HinkalUtils.convertRubicTokenToHinkalToken(fromToken);
  //     const toHinkalToken = HinkalUtils.convertRubicTokenToHinkalToken(toToken);

  //     const fromTokenChanges: TokenChanges<bigint> = {
  //       token: fromHinkalToken,
  //       amount: -BigInt(fromToken.stringWeiAmount)
  //     };

  //     const toTokenChanges: TokenChanges<bigint> = {
  //       token: toHinkalToken,
  //       amount: BigInt(toToken.stringWeiAmount)
  //     };

  //     const subAccount: SubAccount = {
  //       index: 0,
  //       ethAddress: this.walletConnectorService.address,
  //       privateKey: keys.getShieldedPrivateKey(),
  //       name: 'User',
  //       createdAt: new Date().toISOString(),
  //       isHidden: false,
  //       isImported: false
  //     };

  //     await this.hinkalSDK.resetMerkleTreesIfNecessary();

  //     const necessaryAssets = await getNecessaryAssetsForFunding(hinkalSdk, subAccount, [
  //       fromTokenChanges,
  //       toTokenChanges
  //     ]);

  //     const emporiumOps = generateFundApproveAndTransactOps(
  //       hinkalSdk,
  //       necessaryAssets.tokensToFund.map(token => token.erc20TokenAddress),
  //       necessaryAssets.fundAmounts,
  //       necessaryAssets.approveTokenAddresses,
  //       necessaryAssets.approvedTokenAmounts,
  //       UserKeys.getSignerAddressFromPrivateKey(fromChainId, keys.getShieldedPrivateKey()),
  //       rubicSwapData.to,
  //       rubicSwapData.to,
  //       rubicSwapData.data,
  //       BigInt(rubicSwapData.value)
  //     );

  //     const txResult = (await hinkalSdk.actionPrivateWallet(
  //       [fromHinkalToken.erc20TokenAddress, toHinkalToken.erc20TokenAddress],
  //       [fromTokenChanges.amount, toTokenChanges.amount],
  //       [false, true],
  //       emporiumOps,
  //       [fromTokenChanges, toTokenChanges],
  //       subAccount,
  //       undefined,
  //       undefined,
  //       undefined,
  //       true,
  //       undefined,
  //       undefined,
  //       undefined,
  //       false
  //     )) as RelayerTransaction;

  //     return txResult.transactionHash;
  //   } catch (err) {
  //     console.log('FAILED TO SWAP', err);
  //     this.errorService.catch(err);
  //     return '';
  //   }
  // }
}
