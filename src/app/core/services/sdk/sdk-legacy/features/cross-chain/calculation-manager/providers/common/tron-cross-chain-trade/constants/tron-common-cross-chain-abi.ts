import { Abi } from 'viem';

export const tronCommonCrossChainAbi: Abi = [
  {
    inputs: [],
    outputs: [{ type: 'uint256' }],
    name: 'RubicPlatformFee',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    inputs: [],
    outputs: [{ type: 'uint256' }],
    name: 'fixedCryptoFee',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    inputs: [],
    outputs: [{ type: 'address[]' }],
    name: 'getAvailableRouters',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    outputs: [
      { name: 'isIntegrator', type: 'bool' },
      { name: 'tokenFee', type: 'uint32' },
      { name: 'RubicTokenShare', type: 'uint32' },
      { name: 'RubicFixedCryptoShare', type: 'uint32' },
      { name: 'fixedFeeAmount', type: 'uint128' }
    ],
    inputs: [{ type: 'address' }],
    name: 'integratorToFeeInfo',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    outputs: [{ type: 'uint256' }],
    inputs: [{ type: 'address' }],
    name: 'maxTokenAmount',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    outputs: [{ type: 'uint256' }],
    inputs: [{ type: 'address' }],
    name: 'minTokenAmount',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    inputs: [],
    outputs: [{ type: 'bool' }],
    name: 'paused',
    stateMutability: 'View',
    type: 'Function'
  },
  {
    inputs: [
      { name: '_providerInfo', type: 'string' },
      {
        name: '_params',
        type: 'tuple',
        components: [
          { name: 'srcInputToken', type: 'address' },
          { name: 'srcInputAmount', type: 'uint256' },
          { name: 'dstChainID', type: 'uint256' },
          { name: 'dstOutputToken', type: 'address' },
          { name: 'dstMinOutputAmount', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'integrator', type: 'address' },
          { name: 'router', type: 'address' }
        ]
      },
      { name: '_gateway', type: 'address' },
      { name: '_data', type: 'bytes' }
    ],
    name: 'routerCall',
    stateMutability: 'Payable',
    type: 'Function'
  },
  {
    inputs: [
      { name: '_providerInfo', type: 'string' },
      {
        name: '_params',
        type: 'tuple',
        components: [
          { name: 'srcInputToken', type: 'address' },
          { name: 'srcInputAmount', type: 'uint256' },
          { name: 'dstChainID', type: 'uint256' },
          { name: 'dstOutputToken', type: 'address' },
          { name: 'dstMinOutputAmount', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'integrator', type: 'address' },
          { name: 'router', type: 'address' }
        ]
      },
      { name: '_data', type: 'bytes' }
    ],
    name: 'routerCallNative',
    stateMutability: 'Payable',
    type: 'Function'
  }
] as unknown as Abi;
