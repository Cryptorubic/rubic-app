import { AbiItem } from 'web3-utils';

export const SYMBIOSIS_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'RubicFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'inputToken', type: 'address' },
      { internalType: 'uint256', name: 'totalInputAmount', type: 'uint256' },
      { internalType: 'address', name: 'integrator', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' }
    ],
    name: 'SymbiosisCall',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'integrator', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' }
    ],
    name: 'SymbiosisCallWithNative',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as AbiItem[];
