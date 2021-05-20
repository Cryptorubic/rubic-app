export const contractAddress = '0x47cfa99D25b42Db96D4922DF456815B175Ea47F7';

export const ABI = [
  {
    inputs: [
      { internalType: 'uint128', name: '_depositSize', type: 'uint128' },
      {
        internalType: 'uint128',
        name: '_depositFee',
        type: 'uint128'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'sender', type: 'address' },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128'
      }
    ],
    name: 'DepositEthMade',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'tokenAddress', type: 'address' },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'DepositTokenMade',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  { inputs: [], name: 'deposit', outputs: [], stateMutability: 'payable', type: 'function' },
  {
    inputs: [],
    name: 'depositFee',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'depositSize',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'depositToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'depositTokenFee',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'depositTokenSize',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'forbidTokenDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint128', name: 'newFee', type: 'uint128' }],
    name: 'setDepositFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint128', name: '_depositSize', type: 'uint128' },
      {
        internalType: 'uint128',
        name: '_depositFee',
        type: 'uint128'
      }
    ],
    name: 'setDepositSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint128', name: 'newSize', type: 'uint128' }],
    name: 'setDepositSize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      {
        internalType: 'uint128',
        name: '_depositSize',
        type: 'uint128'
      },
      { internalType: 'uint128', name: '_depositFee', type: 'uint128' }
    ],
    name: 'setTokenDepositSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];
