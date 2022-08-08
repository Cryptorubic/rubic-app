import { AbiItem } from 'web3-utils';

export const PROCESSED_TRANSACTION_METHOD_ABI: AbiItem[] = [
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'processedTransactions',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];
