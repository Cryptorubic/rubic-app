import { Abi } from 'viem';

export const tronNativeSwapAbi: Abi = [
  {
    inputs: [
      { internalType: 'address', name: 'fromToken', type: 'address' },
      { internalType: 'string', name: 'toToken', type: 'string' },
      { internalType: 'string', name: 'destination', type: 'string' },
      { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'minReturnAmount', type: 'uint256' }
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'toToken', type: 'string' },
      { internalType: 'string', name: 'destination', type: 'string' },
      { internalType: 'uint256', name: 'minReturnAmount', type: 'uint256' }
    ],
    name: 'swapEth',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
];
