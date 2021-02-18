const SWAPS_ABI = {
  OLD_ABI: [
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
      inputs: [],
      name: 'myWishBasePercent',
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
      inputs: [],
      name: 'myWishAddress',
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
      inputs: [],
      name: 'myWishQuotePercent',
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
        },
        {
          name: '',
          type: 'uint256'
        }
      ],
      name: 'brokers',
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
      name: 'brokerPercents',
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
          indexed: false,
          name: 'owner',
          type: 'address'
        },
        {
          indexed: false,
          name: 'baseAddress',
          type: 'address'
        },
        {
          indexed: false,
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
        },
        {
          indexed: false,
          name: 'baseOnlyInvestor',
          type: 'address'
        },
        {
          indexed: false,
          name: 'minBaseInvestment',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'minQuoteInvestment',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'broker',
          type: 'address'
        },
        {
          indexed: false,
          name: 'brokerBasePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'brokerQuotePercent',
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
      name: 'OrderCancelled',
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
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
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
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
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
          indexed: false,
          name: 'byUser',
          type: 'address'
        }
      ],
      name: 'OrderSwapped',
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
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
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
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
          name: 'broker',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'BrokerSend',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'oldMyWishAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'newMyWishAddress',
          type: 'address'
        }
      ],
      name: 'MyWishAddressChange',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'oldBasePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'oldQuotePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'newBasePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'newQuotePercent',
          type: 'uint256'
        }
      ],
      name: 'MyWishPercentsChange',
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
        },
        {
          name: '_brokerAddress',
          type: 'address'
        },
        {
          name: '_brokerBasePercent',
          type: 'uint256'
        },
        {
          name: '_brokerQuotePercent',
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
      constant: false,
      inputs: [
        {
          name: '_basePercent',
          type: 'uint256'
        },
        {
          name: '_quotePercent',
          type: 'uint256'
        }
      ],
      name: 'setMyWishPercents',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_myWishAddress',
          type: 'address'
        }
      ],
      name: 'setMyWishAddress',
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
      name: 'allBrokersBasePercent',
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
      name: 'allBrokersQuotePercent',
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
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'orderBrokers',
      outputs: [
        {
          name: '',
          type: 'address[]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ],

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
      inputs: [],
      name: 'myWishBasePercent',
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
      inputs: [],
      name: 'myWishAddress',
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
      inputs: [],
      name: 'myWishQuotePercent',
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
        },
        {
          name: '',
          type: 'uint256'
        }
      ],
      name: 'brokers',
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
      name: 'brokerPercents',
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
          indexed: false,
          name: 'owner',
          type: 'address'
        },
        {
          indexed: false,
          name: 'baseAddress',
          type: 'address'
        },
        {
          indexed: false,
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
        },
        {
          indexed: false,
          name: 'baseOnlyInvestor',
          type: 'address'
        },
        {
          indexed: false,
          name: 'minBaseInvestment',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'minQuoteInvestment',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'broker',
          type: 'address'
        },
        {
          indexed: false,
          name: 'brokerBasePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'brokerQuotePercent',
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
      name: 'OrderCancelled',
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
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
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
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
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
          indexed: false,
          name: 'byUser',
          type: 'address'
        }
      ],
      name: 'OrderSwapped',
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
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
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
          indexed: false,
          name: 'id',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'token',
          type: 'address'
        },
        {
          indexed: false,
          name: 'broker',
          type: 'address'
        },
        {
          indexed: false,
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'BrokerSend',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'oldMyWishAddress',
          type: 'address'
        },
        {
          indexed: false,
          name: 'newMyWishAddress',
          type: 'address'
        }
      ],
      name: 'MyWishAddressChange',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'oldBasePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'oldQuotePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'newBasePercent',
          type: 'uint256'
        },
        {
          indexed: false,
          name: 'newQuotePercent',
          type: 'uint256'
        }
      ],
      name: 'MyWishPercentsChange',
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
        },
        {
          name: '_brokerAddress',
          type: 'address'
        },
        {
          name: '_brokerBasePercent',
          type: 'uint256'
        },
        {
          name: '_brokerQuotePercent',
          type: 'uint256'
        }
      ],
      name: 'createOrder',
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
      constant: false,
      inputs: [
        {
          name: '_basePercent',
          type: 'uint256'
        },
        {
          name: '_quotePercent',
          type: 'uint256'
        }
      ],
      name: 'setMyWishPercents',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_myWishAddress',
          type: 'address'
        }
      ],
      name: 'setMyWishAddress',
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
      name: 'allBrokersBasePercent',
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
      name: 'allBrokersQuotePercent',
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
    },
    {
      constant: true,
      inputs: [
        {
          name: '_id',
          type: 'bytes32'
        }
      ],
      name: 'orderBrokers',
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
      inputs: [],
      name: 'feeAmount',
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
  ]
};

export default SWAPS_ABI;
