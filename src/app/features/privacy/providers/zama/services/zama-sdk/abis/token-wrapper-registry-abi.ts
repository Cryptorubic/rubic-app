import { Abi } from 'viem';

export const TOKEN_WRAPPER_REGISTRY_ABI: Abi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [{ internalType: 'address', name: 'target', type: 'address' }],
    name: 'AddressEmptyCode',
    type: 'error'
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      { internalType: 'address', name: 'existingConfidentialTokenAddress', type: 'address' }
    ],
    name: 'ConfidentialTokenAlreadyAssociatedWithToken',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }],
    name: 'ConfidentialTokenDoesNotSupportERC165',
    type: 'error'
  },
  { inputs: [], name: 'ConfidentialTokenZeroAddress', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'implementation', type: 'address' }],
    name: 'ERC1967InvalidImplementation',
    type: 'error'
  },
  { inputs: [], name: 'ERC1967NonPayable', type: 'error' },
  { inputs: [], name: 'FailedCall', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'fromIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'toIndex', type: 'uint256' }
    ],
    name: 'FromIndexGreaterOrEqualToIndex',
    type: 'error'
  },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }],
    name: 'NoTokenAssociatedWithConfidentialToken',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }],
    name: 'NotERC7984',
    type: 'error'
  },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'OwnableInvalidOwner',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }],
    name: 'RevokedConfidentialToken',
    type: 'error'
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      { internalType: 'address', name: 'existingConfidentialTokenAddress', type: 'address' }
    ],
    name: 'TokenAlreadyAssociatedWithConfidentialToken',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'TokenNotRegistered',
    type: 'error'
  },
  { inputs: [], name: 'TokenZeroAddress', type: 'error' },
  { inputs: [], name: 'UUPSUnauthorizedCallContext', type: 'error' },
  {
    inputs: [{ internalType: 'bytes32', name: 'slot', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'tokenAddress', type: 'address' },
      { indexed: true, internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }
    ],
    name: 'ConfidentialTokenRegistered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'tokenAddress', type: 'address' },
      { indexed: true, internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }
    ],
    name: 'ConfidentialTokenRevoked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint64', name: 'version', type: 'uint64' }],
    name: 'Initialized',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }
    ],
    name: 'OwnershipTransferStarted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'implementation', type: 'address' }],
    name: 'Upgraded',
    type: 'event'
  },
  {
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'getConfidentialTokenAddress',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' },
      { internalType: 'address', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }],
    name: 'getTokenAddress',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' },
      { internalType: 'address', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'getTokenConfidentialTokenPair',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenAddress', type: 'address' },
          { internalType: 'address', name: 'confidentialTokenAddress', type: 'address' },
          { internalType: 'bool', name: 'isValid', type: 'bool' }
        ],
        internalType: 'struct ConfidentialTokenWrappersRegistry.TokenWrapperPair',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTokenConfidentialTokenPairs',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenAddress', type: 'address' },
          { internalType: 'address', name: 'confidentialTokenAddress', type: 'address' },
          { internalType: 'bool', name: 'isValid', type: 'bool' }
        ],
        internalType: 'struct ConfidentialTokenWrappersRegistry.TokenWrapperPair[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'getTokenIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'confidentialTokenAddress', type: 'address' }],
    name: 'isConfidentialTokenValid',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
];
