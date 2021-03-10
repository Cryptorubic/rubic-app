import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';

import { IBridgeToken } from './types';
import { RubicError } from '../../../shared/models/errors/RubicError';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';

export class BridgeTransaction {
  public txHash: string;

  public receipt: TransactionReceipt;

  constructor(
    public binanceId: string,
    public network: string,
    public token: IBridgeToken,
    public status: string,
    public depositAddress: string,
    public amount: BigNumber,
    public toAddress: string,
    public web3Api: Web3PrivateService
  ) {}

  public async sendDeposit(onTransactionHash?: (hash: string) => void): Promise<void> {
    let tokenAddress;
    let decimals;
    switch (this.network) {
      case 'ETH':
        tokenAddress = this.token.ethContractAddress;
        decimals = this.token.ethContractDecimal;
        break;
      case 'BSC':
        tokenAddress = this.token.bscContractAddress;
        decimals = this.token.bscContractDecimal;
        break;
      default:
        throw new RubicError(`The ${this.network} network is not supported`);
    }

    const realAmount = this.amount.multipliedBy(10 ** decimals);

    if (tokenAddress) {
      this.receipt = await this.web3Api.transferTokens(
        tokenAddress,
        this.depositAddress,
        realAmount.toString(),
        { onTransactionHash }
      );
    } else {
      this.receipt = await this.web3Api.sendTransaction(
        this.depositAddress,
        realAmount.toString(),
        { onTransactionHash }
      );
    }

    console.log(this.receipt);
    console.log(this.binanceId);
  }
}
