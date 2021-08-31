import { AbiItem } from 'web3-utils';

export const crossChainSwapContractAbi = [
  {
    inputs: [
      { internalType: 'uint128', name: '_numOfThisBlockchain', type: 'uint128' },
      { internalType: 'uint128[]', name: '_numsOfOtherBlockchains', type: 'uint128[]' },
      { internalType: 'uint256[]', name: 'tokenLimits', type: 'uint256[]' },
      { internalType: 'uint256', name: '_maxGasPrice', type: 'uint256' },
      { internalType: 'uint256', name: '_minConfirmationBlocks', type: 'uint256' },
      { internalType: 'uint256', name: '_refundSlippage', type: 'uint256' },
      { internalType: 'contract IUniswapV2Router02', name: '_blockchainRouter', type: 'address' },
      { internalType: 'address[]', name: '_RubicAddresses', type: 'address[]' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Paused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' }
    ],
    name: 'RoleAdminChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
    ],
    name: 'RoleGranted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
    ],
    name: 'RoleRevoked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'blockchain', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'RBCAmountIn', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountSpent', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'newAddress', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'cryptoOutMin', type: 'uint256' },
      { indexed: false, internalType: 'address[]', name: 'path', type: 'address[]' }
    ],
    name: 'TransferCryptoToOtherBlockchainUser',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountWithoutFee', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' }
    ],
    name: 'TransferFromOtherBlockchain',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'blockchain', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'RBCAmountIn', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountSpent', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'newAddress', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'tokenOutMin', type: 'uint256' },
      { indexed: false, internalType: 'address[]', name: 'path', type: 'address[]' }
    ],
    name: 'TransferTokensToOtherBlockchainUser',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Unpaused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountWithoutFee', type: 'uint256' },
      { indexed: false, internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' }
    ],
    name: 'userRefunded',
    type: 'event'
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MANAGER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'OWNER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'RELAYER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'RubicAddresses',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'SIGNATURE_LENGTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'VALIDATOR_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint128', name: 'numOfOtherBlockchain', type: 'uint128' }],
    name: 'addOtherBlockchain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'blockchainCryptoFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'blockchainPool',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'blockchainRouter',
    outputs: [{ internalType: 'contract IUniswapV2Router02', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint128', name: 'oldNumOfOtherBlockchain', type: 'uint128' },
      { internalType: 'uint128', name: 'newNumOfOtherBlockchain', type: 'uint128' }
    ],
    name: 'changeOtherBlockchain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'statusCode', type: 'uint256' },
      { internalType: 'bytes32', name: 'hashedParams', type: 'bytes32' }
    ],
    name: 'changeTxStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'collectCryptoFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'collectTokenFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'continueExecution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'uint256', name: 'offset', type: 'uint256' }
    ],
    name: 'ecOffsetRecover',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'existingOtherBlockchain',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'feeAmountOfBlockchain',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
      { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' }
    ],
    name: 'getHashPacked',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'blockchain', type: 'uint256' }],
    name: 'getOtherBlockchainAvailableByNum',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isManager',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isOwner',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isRelayer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isValidator',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maxGasPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maxTokenAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'minConfirmationBlocks',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'minConfirmationSignatures',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'minTokenAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'numOfThisBlockchain',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pauseExecution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'processedTransactions',
    outputs: [
      { internalType: 'uint256', name: 'statusCode', type: 'uint256' },
      { internalType: 'bytes32', name: 'hashedParams', type: 'bytes32' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
          { internalType: 'bytes', name: 'concatSignatures', type: 'bytes' }
        ],
        internalType: 'struct SwapContract.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'refundCryptoToUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'refundSlippage',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
          { internalType: 'bytes', name: 'concatSignatures', type: 'bytes' }
        ],
        internalType: 'struct SwapContract.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'refundTokensToUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint128', name: 'numOfOtherBlockchain', type: 'uint128' }],
    name: 'removeOtherBlockchain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint128', name: '_blockchainNum', type: 'uint128' },
      { internalType: 'uint256', name: 'feeAmount', type: 'uint256' }
    ],
    name: 'setCryptoFeeOfBlockchain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint128', name: '_blockchainNum', type: 'uint128' },
      { internalType: 'uint256', name: 'feeAmount', type: 'uint256' }
    ],
    name: 'setFeeAmountOfBlockchain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_maxGasPrice', type: 'uint256' }],
    name: 'setMaxGasPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_maxTokenAmount', type: 'uint256' }],
    name: 'setMaxTokenAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_minConfirmationBlocks', type: 'uint256' }],
    name: 'setMinConfirmationBlocks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_minConfirmationSignatures', type: 'uint256' }],
    name: 'setMinConfirmationSignatures',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_minTokenAmount', type: 'uint256' }],
    name: 'setMinTokenAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_poolAddress', type: 'address' }],
    name: 'setPoolAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_refundSlippage', type: 'uint256' }],
    name: 'setRefundSlippage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'contract IUniswapV2Router02', name: '_router', type: 'address' }],
    name: 'setRouter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint128', name: '_blockchainNum', type: 'uint128' },
      { internalType: 'address', name: '_RubicAddress', type: 'address' }
    ],
    name: 'setRubicAddressOfBlockchain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'blockchain', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenInAmount', type: 'uint256' },
          { internalType: 'address[]', name: 'firstPath', type: 'address[]' },
          { internalType: 'address[]', name: 'secondPath', type: 'address[]' },
          { internalType: 'uint256', name: 'exactRBCtokenOut', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenOutMin', type: 'uint256' },
          { internalType: 'string', name: 'newAddress', type: 'string' },
          { internalType: 'bool', name: 'swapToCrypto', type: 'bool' }
        ],
        internalType: 'struct SwapContract.swapToParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToOtherBlockchain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
          { internalType: 'bytes', name: 'concatSignatures', type: 'bytes' }
        ],
        internalType: 'struct SwapContract.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapCryptoToUserWithFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'blockchain', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenInAmount', type: 'uint256' },
          { internalType: 'address[]', name: 'firstPath', type: 'address[]' },
          { internalType: 'address[]', name: 'secondPath', type: 'address[]' },
          { internalType: 'uint256', name: 'exactRBCtokenOut', type: 'uint256' },
          { internalType: 'uint256', name: 'tokenOutMin', type: 'uint256' },
          { internalType: 'string', name: 'newAddress', type: 'string' },
          { internalType: 'bool', name: 'swapToCrypto', type: 'bool' }
        ],
        internalType: 'struct SwapContract.swapToParams',
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
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amountWithFee', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes32', name: 'originalTxHash', type: 'bytes32' },
          { internalType: 'bytes', name: 'concatSignatures', type: 'bytes' }
        ],
        internalType: 'struct SwapContract.swapFromParams',
        name: 'params',
        type: 'tuple'
      }
    ],
    name: 'swapTokensToUserWithFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
    name: 'toEthSignedMessageHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'newOwner', type: 'address' },
      { internalType: 'address', name: 'newManager', type: 'address' }
    ],
    name: 'transferOwnerAndSetManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  { stateMutability: 'payable', type: 'receive' }
] as AbiItem[];
