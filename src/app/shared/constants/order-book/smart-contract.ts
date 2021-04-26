import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const ORDER_BOOK_CONTRACT = {
  ADDRESSES: [
    {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xAAaCFf66942df4f1e1cB32C21Af875AC971A8117',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xEAFbb34e5200Fff4F3998e8af43721090A3Aeef3',
      [BLOCKCHAIN_NAME.MATIC]: '0xcae0b5F3b4256572875E4E2A2ee2C83434097Af8'
    },
    {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xf954DdFbC31b775BaaF245882701FB1593A7e7BC',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xCA647085E35ABd0d6eBD8cf56f8bF4f285A42951',
      [BLOCKCHAIN_NAME.MATIC]: '0x9a234B3899CAf15413987BF94e19539ccd43A9C1'
    },
    {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0x9167186EcFc4cCd98CAD792c9a01FedCee5A16C4',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xB955cb81f5CB63e0928168ed6E7dEA9032707e67',
      [BLOCKCHAIN_NAME.MATIC]: '0x0564F0e589F15Fb0ce67e0DbCb1B737e14447f96',
      // testnets
      [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: '0x29F293c3b959a0F227b3672eb0b69B179aea0a5A',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: '0xCA647085E35ABd0d6eBD8cf56f8bF4f285A42951',
      [BLOCKCHAIN_NAME.MATIC_TESTNET]: '0x9a234B3899CAf15413987BF94e19539ccd43A9C1'
    }
  ],
  ABI: [
    // ABI[0]
    [
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
    // ABI[1]
    [
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
    ],
    // ABI[2]
    [
      {
        inputs: [
          { internalType: 'uint256', name: '_feeAmount', type: 'uint256' },
          { internalType: 'address payable', name: '_feeAddress', type: 'address' }
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
          { indexed: false, internalType: 'address', name: 'token', type: 'address' },
          { indexed: false, internalType: 'address', name: 'broker', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        name: 'BrokerSend',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
          { indexed: false, internalType: 'address', name: 'token', type: 'address' },
          { indexed: false, internalType: 'address', name: 'user', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'balance', type: 'uint256' }
        ],
        name: 'Deposit',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'address', name: 'oldMyWishAddress', type: 'address' },
          { indexed: false, internalType: 'address', name: 'newMyWishAddress', type: 'address' }
        ],
        name: 'MyWishAddressChange',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'uint256', name: 'oldBasePercent', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'oldQuotePercent', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'newBasePercent', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'newQuotePercent', type: 'uint256' }
        ],
        name: 'MyWishPercentsChange',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' }],
        name: 'OrderCancelled',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
          { indexed: false, internalType: 'address', name: 'owner', type: 'address' },
          { indexed: false, internalType: 'address', name: 'baseAddress', type: 'address' },
          { indexed: false, internalType: 'address', name: 'quoteAddress', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'baseLimit', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'quoteLimit', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'expirationTimestamp', type: 'uint256' },
          { indexed: false, internalType: 'address', name: 'baseOnlyInvestor', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'minBaseInvestment', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'minQuoteInvestment', type: 'uint256' },
          { indexed: false, internalType: 'address', name: 'broker', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'brokerBasePercent', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'brokerQuotePercent', type: 'uint256' }
        ],
        name: 'OrderCreated',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
          { indexed: false, internalType: 'address', name: 'byUser', type: 'address' }
        ],
        name: 'OrderSwapped',
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
        inputs: [
          { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
          { indexed: false, internalType: 'address', name: 'token', type: 'address' },
          { indexed: false, internalType: 'address', name: 'user', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        name: 'Refund',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
          { indexed: false, internalType: 'address', name: 'token', type: 'address' },
          { indexed: false, internalType: 'address', name: 'user', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        name: 'SwapSend',
        type: 'event'
      },
      {
        constant: true,
        inputs: [],
        name: 'MAX_INVESTORS',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'allBrokersBasePercent',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'allBrokersQuotePercent',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'baseAddresses',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'baseInvestors',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'baseLimit',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'baseOnlyInvestor',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'baseRaised',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '_id', type: 'bytes32' },
          { internalType: 'address', name: '_user', type: 'address' }
        ],
        name: 'baseUserInvestment',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'address', name: '', type: 'address' },
          { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'brokerPercents',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        name: 'brokers',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: false,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'cancel',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
        name: 'createKey',
        outputs: [{ internalType: 'bytes32', name: 'result', type: 'bytes32' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          { internalType: 'address', name: '_baseAddress', type: 'address' },
          { internalType: 'address', name: '_quoteAddress', type: 'address' },
          { internalType: 'uint256', name: '_baseLimit', type: 'uint256' },
          { internalType: 'uint256', name: '_quoteLimit', type: 'uint256' },
          { internalType: 'uint256', name: '_expirationTimestamp', type: 'uint256' },
          { internalType: 'address', name: '_baseOnlyInvestor', type: 'address' },
          { internalType: 'uint256', name: '_minBaseInvestment', type: 'uint256' },
          { internalType: 'uint256', name: '_minQuoteInvestment', type: 'uint256' },
          { internalType: 'address', name: '_brokerAddress', type: 'address' },
          { internalType: 'uint256', name: '_brokerBasePercent', type: 'uint256' },
          { internalType: 'uint256', name: '_brokerQuotePercent', type: 'uint256' }
        ],
        name: 'createOrder',
        outputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        payable: true,
        stateMutability: 'payable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          { internalType: 'bytes32', name: '_id', type: 'bytes32' },
          { internalType: 'address', name: '_token', type: 'address' },
          { internalType: 'uint256', name: '_amount', type: 'uint256' }
        ],
        name: 'deposit',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'expirationTimestamps',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'feeAddress',
        outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'feeAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'address', name: '', type: 'address' },
          { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'investments',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'address', name: '', type: 'address' },
          { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        name: 'investors',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'isBaseFilled',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'isCancelled',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'isOwner',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'isQuoteFilled',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'isSwapped',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'limits',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'minInvestments',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'myWishAddress',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'myWishBasePercent',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'myWishQuotePercent',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'orderBrokers',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'owners',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
        name: 'quoteAddresses',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'quoteInvestors',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'quoteLimit',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
        name: 'quoteRaised',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '_id', type: 'bytes32' },
          { internalType: 'address', name: '_user', type: 'address' }
        ],
        name: 'quoteUserInvestment',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          { internalType: 'bytes32', name: '', type: 'bytes32' },
          { internalType: 'address', name: '', type: 'address' }
        ],
        name: 'raised',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          { internalType: 'bytes32', name: '_id', type: 'bytes32' },
          { internalType: 'address', name: '_token', type: 'address' }
        ],
        name: 'refund',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
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
        constant: false,
        inputs: [
          { internalType: 'uint256', name: '_feeAmount', type: 'uint256' },
          { internalType: 'address payable', name: '_feeAddress', type: 'address' }
        ],
        name: 'setFeeParameters',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [{ internalType: 'address', name: '_myWishAddress', type: 'address' }],
        name: 'setMyWishAddress',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          { internalType: 'uint256', name: '_basePercent', type: 'uint256' },
          { internalType: 'uint256', name: '_quotePercent', type: 'uint256' }
        ],
        name: 'setMyWishPercents',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [{ internalType: 'contract Vault', name: '_vault', type: 'address' }],
        name: 'setVault',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [
          { internalType: 'address', name: '', type: 'address' },
          { internalType: 'uint256', name: '', type: 'uint256' },
          { internalType: 'bytes', name: '', type: 'bytes' }
        ],
        name: 'tokenFallback',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: false,
        inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'vault',
        outputs: [{ internalType: 'contract Vault', name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ]
  ]
};
