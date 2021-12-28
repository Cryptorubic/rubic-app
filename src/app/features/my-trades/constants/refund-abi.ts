import { AbiItem } from 'web3-utils';

export const RefundAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'bytes32[]', name: '_proof', type: 'bytes32[]' },
      { internalType: 'address', name: '_who', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: 'rootInd', type: 'uint256' }
    ],
    name: 'getTokensByMerkleProof',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'merkleRoots',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  }
];
