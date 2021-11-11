import { AbiItem } from 'web3-utils';

const SolarBeamContractAbi = [
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
    name: 'getAmountsIn',
    inputs: [
      { type: 'uint256', name: 'amountOut', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'uint256', name: 'fee', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
    name: 'getAmountsOut',
    inputs: [
      { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'uint256', name: 'fee', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'payable',
    outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
    name: 'swapExactETHForTokens',
    inputs: [
      { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'address', name: 'to', internalType: 'address' },
      { type: 'uint256', name: 'deadline', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'payable',
    outputs: [],
    name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    inputs: [
      { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'address', name: 'to', internalType: 'address' },
      { type: 'uint256', name: 'deadline', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
    name: 'swapExactTokensForETH',
    inputs: [
      { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
      { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'address', name: 'to', internalType: 'address' },
      { type: 'uint256', name: 'deadline', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
    inputs: [
      { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
      { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'address', name: 'to', internalType: 'address' },
      { type: 'uint256', name: 'deadline', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [{ type: 'uint256[]', name: 'amounts', internalType: 'uint256[]' }],
    name: 'swapExactTokensForTokens',
    inputs: [
      { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
      { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'address', name: 'to', internalType: 'address' },
      { type: 'uint256', name: 'deadline', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    inputs: [
      { type: 'uint256', name: 'amountIn', internalType: 'uint256' },
      { type: 'uint256', name: 'amountOutMin', internalType: 'uint256' },
      { type: 'address[]', name: 'path', internalType: 'address[]' },
      { type: 'address', name: 'to', internalType: 'address' },
      { type: 'uint256', name: 'deadline', internalType: 'uint256' }
    ]
  }
] as AbiItem[];

export default SolarBeamContractAbi;
