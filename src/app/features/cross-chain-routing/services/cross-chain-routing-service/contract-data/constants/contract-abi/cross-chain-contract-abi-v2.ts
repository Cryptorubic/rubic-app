import { AbiItem } from 'web3-utils';

export const crossChainContractAbiV2 = [
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
            internalType: 'address[]',
            name: 'firstPath',
            type: 'address[]'
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
            internalType: 'bool',
            name: 'withFee',
            type: 'bool'
          },
          {
            internalType: 'string',
            name: 'signature',
            type: 'string'
          }
        ],
        internalType: 'struct ISwapContract.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapTokensToOtherBlockchain',
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
            internalType: 'address[]',
            name: 'firstPath',
            type: 'address[]'
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
            internalType: 'bool',
            name: 'withFee',
            type: 'bool'
          },
          {
            internalType: 'string',
            name: 'signature',
            type: 'string'
          }
        ],
        internalType: 'struct ISwapContract.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToOtherBlockchain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as AbiItem[];
