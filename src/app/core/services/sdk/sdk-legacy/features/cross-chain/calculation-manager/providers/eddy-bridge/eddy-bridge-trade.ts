import BigNumber from 'bignumber.js';
import { EvmApiCrossChainTrade } from '../../../../ws-api/chains/evm/evm-api-cross-chain-trade';
import { EvmBasicTransactionOptions, UnnecessaryApproveError } from '@cryptorubic/web3';

export class EddyBridgeTrade extends EvmApiCrossChainTrade {
  public override async needApprove(): Promise<boolean> {
    // @TODO API FIX
    this.checkWalletConnected();
    if (this.from.isNative) return false;

    const allowance = await this.chainAdapter.client.getAllowance(
      this.from.address,
      this.walletAddress,
      this.contractSpender
    );
    // need allowance = amount + 1 wei at least
    return this.from.weiAmount.gte(allowance.allowanceWei);
  }

  public override async approve(
    options: EvmBasicTransactionOptions,
    checkNeedApprove = true,
    amount: BigNumber = new BigNumber(0)
  ): Promise<string> {
    if (checkNeedApprove) {
      const needApprove = await this.needApprove();
      if (!needApprove) {
        throw new UnnecessaryApproveError();
      }
    }
    this.checkWalletConnected();
    await this.checkBlockchainCorrect();
    // because of error on EddyBridge contract(they check on allowance > amount instead of allowance >= amount)
    const approveAmount = amount.plus(1);

    return super.approve(options, checkNeedApprove, approveAmount);
  }
}
