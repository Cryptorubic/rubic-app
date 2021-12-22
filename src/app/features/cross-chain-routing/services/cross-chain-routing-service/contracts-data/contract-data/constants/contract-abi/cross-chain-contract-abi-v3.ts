import { AbiItem } from 'web3-utils';

export const crossChainContractAbiV3 = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'blockchain',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenInAmount',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'firstPath',
            type: 'bytes'
          },
          {
            internalType: 'bytes32[]',
            name: 'secondPath',
            type: 'bytes32[]'
          },
          {
            internalType: 'uint256',
            name: 'exactRBCtokenOut',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenOutMin',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'newAddress',
            type: 'bytes32'
          },
          {
            internalType: 'bool',
            name: 'swapToCrypto',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'swapExactFor',
            type: 'bool'
          },
          {
            internalType: 'string',
            name: 'signature',
            type: 'string'
          }
        ],
        internalType: 'struct ISwapContractV3.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapTokensToOtherBlockchainV3',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'blockchain',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenInAmount',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'firstPath',
            type: 'bytes'
          },
          {
            internalType: 'bytes32[]',
            name: 'secondPath',
            type: 'bytes32[]'
          },
          {
            internalType: 'uint256',
            name: 'exactRBCtokenOut',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenOutMin',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'newAddress',
            type: 'bytes32'
          },
          {
            internalType: 'bool',
            name: 'swapToCrypto',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'swapExactFor',
            type: 'bool'
          },
          {
            internalType: 'string',
            name: 'signature',
            type: 'string'
          }
        ],
        internalType: 'struct ISwapContractV3.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToOtherBlockchainV3',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amountWithFee',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOutMin',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'path',
            type: 'bytes'
          },
          {
            internalType: 'bytes32',
            name: 'originalTxHash',
            type: 'bytes32'
          },
          {
            internalType: 'bytes',
            name: 'concatSignatures',
            type: 'bytes'
          }
        ],
        internalType: 'struct ISwapContractV3.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapTokensToUserWithFeeV3',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amountWithFee',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'amountOutMin',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'path',
            type: 'bytes'
          },
          {
            internalType: 'bytes32',
            name: 'originalTxHash',
            type: 'bytes32'
          },
          {
            internalType: 'bytes',
            name: 'concatSignatures',
            type: 'bytes'
          }
        ],
        internalType: 'struct ISwapContractV3.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToUserWithFeeV3',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];
