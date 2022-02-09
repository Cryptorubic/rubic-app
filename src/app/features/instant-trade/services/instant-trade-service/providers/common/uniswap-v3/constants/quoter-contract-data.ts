import { AbiItem } from 'web3-utils';
import { ContractData } from '@shared/models/blockchain/contract-data';

const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

const QUOTER_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'bytes', name: 'path', type: 'bytes' },
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' }
    ],
    name: 'quoteExactInput',
    outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenIn', type: 'address' },
      { internalType: 'address', name: 'tokenOut', type: 'address' },
      { internalType: 'uint24', name: 'fee', type: 'uint24' },
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];

export const UNISWAP_V3_QUOTER_CONTRACT: ContractData = {
  address: QUOTER_CONTRACT_ADDRESS,
  abi: QUOTER_CONTRACT_ABI
};
