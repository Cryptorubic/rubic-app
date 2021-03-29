export default [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_tokenAddress',
        type: 'address',
        internalType: 'contract IERC20'
      },
      {
        name: '_feeAddress',
        type: 'address',
        internalType: 'address'
      },
      {
        name: '_numOfThisBlockchain',
        type: 'uint128',
        internalType: 'uint128'
      },
      {
        name: '_numsOfOtherBlockchains',
        type: 'uint128[]',
        internalType: 'uint128[]'
      }
    ],
    stateMutability: 'nonpayable'
  },
  {
    name: 'RoleAdminChanged',
    type: 'event',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'previousAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'newAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      }
    ],
    anonymous: false
  },
  {
    name: 'RoleGranted',
    type: 'event',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address'
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    name: 'RoleRevoked',
    type: 'event',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address'
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    name: 'TransferFromOtherBlockchain',
    type: 'event',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      }
    ],
    anonymous: false
  },
  {
    name: 'TransferToOtherBlockchain',
    type: 'event',
    inputs: [
      {
        name: 'blockchain',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128'
      },
      {
        name: 'user',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      },
      {
        name: 'newAddress',
        type: 'string',
        indexed: false,
        internalType: 'string'
      }
    ],
    anonymous: false
  },
  {
    name: 'DEFAULT_ADMIN_ROLE',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'MANAGER_ROLE',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'OWNER_ROLE',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'addOtherBlockchain',
    type: 'function',
    inputs: [
      {
        name: 'numOfOtherBlockchain',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'changeFeeAddress',
    type: 'function',
    inputs: [
      {
        name: 'newFeeAddress',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'changeOtherBlockchain',
    type: 'function',
    inputs: [
      {
        name: 'oldNumOfOtherBlockchain',
        type: 'uint128',
        internalType: 'uint128'
      },
      {
        name: 'newNumOfOtherBlockchain',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'existingOtherBlockchain',
    type: 'function',
    inputs: [
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'feeAddress',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'feeAmountOfBlockchain',
    type: 'function',
    inputs: [
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'getOtherBlockchainAvailableByNum',
    type: 'function',
    inputs: [
      {
        name: 'blockchain',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'getRoleAdmin',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'getRoleMember',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'getRoleMemberCount',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'grantRole',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'hasRole',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'numOfThisBlockchain',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'removeOtherBlockchain',
    type: 'function',
    inputs: [
      {
        name: 'numOfOtherBlockchain',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'renounceRole',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'revokeRole',
    type: 'function',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'setFeeAmountOfBlockchain',
    type: 'function',
    inputs: [
      {
        name: 'blockchainNum',
        type: 'uint128',
        internalType: 'uint128'
      },
      {
        name: 'feeAmount',
        type: 'uint128',
        internalType: 'uint128'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'tokenAddress',
    type: 'function',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IERC20'
      }
    ],
    stateMutability: 'view'
  },
  {
    name: 'transferOwnerAndSetManager',
    type: 'function',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'newManager',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'transferToOtherBlockchain',
    type: 'function',
    inputs: [
      {
        name: 'blockchain',
        type: 'uint128',
        internalType: 'uint128'
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'newAddress',
        type: 'string',
        internalType: 'string'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'transferToUserWithFee',
    type: 'function',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'amountWithFee',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'transferToUserWithoutFee',
    type: 'function',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
];
