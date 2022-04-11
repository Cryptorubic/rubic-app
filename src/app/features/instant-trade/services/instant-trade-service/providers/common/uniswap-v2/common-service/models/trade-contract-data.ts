import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { AbiItem } from 'web3-utils';

export interface TradeContractData {
  contractAddress: string;
  contractAbi: AbiItem[];
  methodName: string;
  methodArguments: unknown[];
  options?: TransactionOptions;
}
