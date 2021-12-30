import { AbiItem } from 'web3-utils';

export const SWAP_ROUTER_CONTRACT_ADDRESS = '0x89D6B81A1Ef25894620D05ba843d83B0A296239e';

export const SWAP_ROUTER_CONTRACT_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'path',
            type: 'bytes'
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOutMinimum',
            type: 'uint256'
          }
        ],
        internalType: 'struct ISwapRouter.ExactInputParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInput',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
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
            internalType: 'address',
            name: 'recipient',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOutMinimum',
            type: 'uint256'
          },
          {
            internalType: 'uint160',
            name: 'limitSqrtPrice',
            type: 'uint160'
          }
        ],
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'exactInputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]'
      }
    ],
    name: 'multicall',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountMinimum',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'unwrapWNativeToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as AbiItem[];
