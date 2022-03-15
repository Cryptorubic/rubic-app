import { AbiItem } from 'web3-utils';

export const crossChainContractAbiInch = [
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
            name: 'srcAmount',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'srcToken',
            type: 'address'
          },
          {
            internalType: 'bytes32[]',
            name: 'secondPath',
            type: 'bytes32[]'
          },
          {
            internalType: 'uint256',
            name: 'minTransitOut',
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
            internalType: 'address',
            name: 'provider',
            type: 'address'
          },
          {
            internalType: 'bool',
            name: 'swapToCrypto',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          },
          {
            internalType: 'string',
            name: 'signature',
            type: 'string'
          }
        ],
        internalType: 'struct ISwapContractInch.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapTokensToOtherBlockchainInch',
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
            name: 'srcAmount',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'srcToken',
            type: 'address'
          },
          {
            internalType: 'bytes32[]',
            name: 'secondPath',
            type: 'bytes32[]'
          },
          {
            internalType: 'uint256',
            name: 'minTransitOut',
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
            internalType: 'address',
            name: 'provider',
            type: 'address'
          },
          {
            internalType: 'bool',
            name: 'swapToCrypto',
            type: 'bool'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          },
          {
            internalType: 'string',
            name: 'signature',
            type: 'string'
          }
        ],
        internalType: 'struct ISwapContractInch.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToOtherBlockchainInch',
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
            internalType: 'address',
            name: 'dstToken',
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
            internalType: 'bytes32',
            name: 'originalTxHash',
            type: 'bytes32'
          },
          {
            internalType: 'bytes',
            name: 'concatSignatures',
            type: 'bytes'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          }
        ],
        internalType: 'struct ISwapContractInch.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapTokensToUserWithFeeInch',
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
            internalType: 'address',
            name: 'dstToken',
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
            internalType: 'bytes32',
            name: 'originalTxHash',
            type: 'bytes32'
          },
          {
            internalType: 'bytes',
            name: 'concatSignatures',
            type: 'bytes'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          }
        ],
        internalType: 'struct ISwapContractInch.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToUserWithFeeInch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];
