export const SWAPS_V2  = {
  ABI: [
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        },
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'raised',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'isSwapped',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'quoteAddresses',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'expirationTimestamps',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'baseOnlyInvestor',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        },
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'limits',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'MAX_INVESTORS',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        },
        {
          name: '',
          type: 'address'
        },
        {
          name: '',
          type: 'uint256'
        }
      ],
      name: 'investors',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        },
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'minInvestments',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'isOwner',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'isCancelled',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        },
        {
          name: '',
          type: 'address'
        },
        {
          name: '',
          type: 'address'
        }
      ],
      name: 'investments',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'baseAddresses',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'transferOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      name: 'owners',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'vault',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: true,
          name: 'owner',
          type: 'address'
        },
        {
          indexed: true,
          name: 'baseAddress',
          type: 'address'
        },
        {
          indexed: true,
          name: 'quoteAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'baseLimit',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'quoteLimit',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'expirationTimestamp',
          type: 'uint256'
        }
      ],
      name: 'OrderCreated',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'id',
          type: 'bytes32'
        }
      ],
      name: 'Cancel',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: true,
          name: 'token',
          type: 'address'
        },
        {
          indexed: true,
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'balance',
          type: 'uint256'
        }
      ],
      name: 'Deposit',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: true,
          name: 'token',
          type: 'address'
        },
        {
          indexed: true,
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'Refund',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: true,
          name: 'byUser',
          type: 'address'
        }
      ],
      name: 'Swap',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: true,
          name: 'token',
          type: 'address'
        },
        {
          indexed: true,
          name: 'user',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'SwapSend',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'previousOwner',
          type: 'address'
        },
        {
          indexed: true,
          name: 'newOwner',
          type: 'address'
        }
      ],
      name: 'OwnershipTransferred',
      type: 'event'
    },
    {
      constant: false,
      inputs: [
        {
          name: '',
          type: 'address'
        },
        {
          name: '',
          type: 'uint256'
        },
        {
          name: '',
          type: 'bytes'
        }
      ],
      name: 'tokenFallback',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        },
        {
          name: '_baseAddress',
          type: 'address'
        },
        {
          name: '_quoteAddress',
          type: 'address'
        },
        {
          name: '_baseLimit',
          type: 'uint256'
        },
        {
          name: '_quoteLimit',
          type: 'uint256'
        },
        {
          name: '_expirationTimestamp',
          type: 'uint256'
        },
        {
          name: '_baseOnlyInvestor',
          type: 'address'
        },
        {
          name: '_minBaseInvestment',
          type: 'uint256'
        },
        {
          name: '_minQuoteInvestment',
          type: 'uint256'
        }
      ],
      name: 'createOrder',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        },
        {
          name: '_token',
          type: 'address'
        },
        {
          name: '_amount',
          type: 'uint256'
        }
      ],
      name: 'deposit',
      outputs: [],
      payable: true,
      stateMutability: 'payable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'cancel',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        },
        {
          name: '_token',
          type: 'address'
        }
      ],
      name: 'refund',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_vault',
          type: 'address'
        }
      ],
      name: 'setVault',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address'
        }
      ],
      name: 'createKey',
      outputs: [
        {
          name: 'result',
          type: 'bytes32'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'baseLimit',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'quoteLimit',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'baseRaised',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'quoteRaised',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'isBaseFilled',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'isQuoteFilled',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'baseInvestors',
      outputs: [
        {
          name: '',
          type: 'address[]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'quoteInvestors',
      outputs: [
        {
          name: '',
          type: 'address[]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        },
        {
          name: '_user',
          type: 'address'
        }
      ],
      name: 'baseUserInvestment',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        },
        {
          name: '_user',
          type: 'address'
        }
      ],
      name: 'quoteUserInvestment',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ],
  ADDRESS: '0x79f4886a694c8e1fc7b94be3aeb818aae2e90c4d'
};
