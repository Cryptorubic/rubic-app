import { AbiItem } from 'web3-utils';

export const quoterContractAddress = '0xAaaCfe8F51B8baA4286ea97ddF145e946d5e7f46';

export const quoterContractAbi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'path',
        type: 'bytes'
      },
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      }
    ],
    name: 'quoteExactInput',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint16[]',
        name: 'fees',
        type: 'uint16[]'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenIn',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'tokenOut',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint160',
        name: 'limitSqrtPrice',
        type: 'uint160'
      }
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint16',
        name: 'fee',
        type: 'uint16'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];
