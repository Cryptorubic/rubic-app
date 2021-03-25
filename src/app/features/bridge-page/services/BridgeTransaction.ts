import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';

import { RubicError } from '../../../shared/models/errors/RubicError';
import { Web3PrivateService } from '../../../core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeToken } from '../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export class BridgeTransaction {
  public txHash: string;

  public receipt: TransactionReceipt;

  constructor(
    public binanceId: string,
    public network: BLOCKCHAIN_NAME,
    public token: BridgeToken,
    public status: string,
    public depositAddress: string,
    public amount: BigNumber,
    public toAddress: string,
    public web3Private: Web3PrivateService
  ) {}

  public async sendDeposit(onTransactionHash?: (hash: string) => void): Promise<void> {
    let tokenAddress;
    let decimals;
    switch (this.network) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        tokenAddress = this.token.ethContractAddress;
        decimals = this.token.ethContractDecimal;
        break;
      case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
        tokenAddress = this.token.bscContractAddress;
        decimals = this.token.bscContractDecimal;
        break;
      default:
        throw new RubicError(`The ${this.network} network is not supported`);
    }

    const realAmount = this.amount.multipliedBy(10 ** decimals);

    if (tokenAddress) {
      const estimatedGas = '120000'; // TODO: хотфикс сломавшегося в метамаске рассчета газа. Estimated gas не подойдет, т.к. в BSC не работает rpc
      this.receipt = await this.web3Private.transferTokens(
        tokenAddress,
        this.depositAddress,
        realAmount.toFixed(0),
        { onTransactionHash, gas: estimatedGas }
      );
    } else {
      this.receipt = await this.web3Private.sendTransaction(
        this.depositAddress,
        realAmount.toFixed(0),
        { onTransactionHash, inWei: true }
      );
    }
  }
}
