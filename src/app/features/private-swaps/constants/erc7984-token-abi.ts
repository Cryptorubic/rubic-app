// ACLAddress: 0xcA2E8f1F656CD25C01F05d0b243Ab1ecd4a8ffb6,
// CoprocessorAddress: 0xD82385dADa1ae3E969447f20A3164F6213100e75,
// KMSVerifierAddress: 0x77627828a55156b04Ac0DC0eb30467f1a552BB03

import { Abi } from 'viem';

export const ERC7984_TOKEN_ABI: Abi = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'confidentialBalanceOf',
    outputs: [{ internalType: 'euint64', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'confidentialProtocolId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'confidentialTotalSupply',
    outputs: [{ internalType: 'euint64', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'externalEuint64', name: 'encryptedAmount', type: 'bytes32' },
      { internalType: 'bytes', name: 'inputProof', type: 'bytes' }
    ],
    name: 'confidentialTransfer',
    outputs: [{ internalType: 'euint64', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'euint64', name: 'encryptedAmount', type: 'bytes32' },
      { internalType: 'uint64', name: 'cleartextAmount', type: 'uint64' },
      { internalType: 'bytes', name: 'decryptionProof', type: 'bytes' }
    ],
    name: 'discloseEncryptedAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'euint64', name: 'burntAmount', type: 'bytes32' },
      { internalType: 'uint64', name: 'burntAmountCleartext', type: 'uint64' },
      { internalType: 'bytes', name: 'decryptionProof', type: 'bytes' }
    ],
    name: 'finalizeUnwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'externalEuint64', name: 'encryptedAmount', type: 'bytes32' },
      { internalType: 'bytes', name: 'inputProof', type: 'bytes' }
    ],
    name: 'unwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'wrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'receiver', type: 'address' },
      { indexed: false, internalType: 'euint64', name: 'amount', type: 'bytes32' }
    ],
    name: 'UnwrapRequested',
    type: 'event'
  }
];
