import { AbiItem } from 'web3-utils';

export const IT_PROXY_FEE_CONTRACT_ADDRESS = '0x90A23d6d6A857C9749d57c5a6d2935AA17C19C19';

export enum IT_PROXY_FEE_CONTRACT_METHOD {
  SWAP = 'swap',
  SWAP_WITH_PROMOTER = 'swapWithPromoter'
}

export const IT_PROXY_FEE_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'fromToken', type: 'address' },
      { internalType: 'address', name: 'toToken', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'address', name: 'targetDex', type: 'address' },
      { internalType: 'bytes', name: 'encodedParameters', type: 'bytes' },
      {
        components: [
          { internalType: 'uint256', name: 'fee', type: 'uint256' },
          { internalType: 'address', name: 'feeTarget', type: 'address' }
        ],
        internalType: 'struct FeeInfo',
        name: 'feeInfo',
        type: 'tuple'
      }
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'fromToken', type: 'address' },
      { internalType: 'address', name: 'toToken', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'address', name: 'targetDex', type: 'address' },
      { internalType: 'bytes', name: 'encodedParameters', type: 'bytes' },
      {
        components: [
          { internalType: 'uint256', name: 'fee', type: 'uint256' },
          { internalType: 'address', name: 'feeTarget', type: 'address' }
        ],
        internalType: 'struct FeeInfo',
        name: 'feeInfo',
        type: 'tuple'
      },
      { internalType: 'address', name: 'promoterAddress', type: 'address' }
    ],
    name: 'swapWithPromoter',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as AbiItem[];
