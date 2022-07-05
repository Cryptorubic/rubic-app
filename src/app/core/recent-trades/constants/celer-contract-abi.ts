import { AbiItem } from 'web3-utils';

export const celerContractAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_messageBus', type: 'address' },
      { internalType: 'address[]', name: '_supportedDEXes', type: 'address[]' },
      { internalType: 'address', name: '_nativeWrap', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
      { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
    ],
    name: 'BridgeRequestSent',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'messageBus', type: 'address' }],
    name: 'MessageBusUpdated',
    type: 'event'
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
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'dstAmount', type: 'uint256' },
      { indexed: false, internalType: 'enum SwapBase.SwapStatus', name: 'status', type: 'uint8' }
    ],
    name: 'SwapRequestDone',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
      { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
    ],
    name: 'SwapRequestSentInch',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
      { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
    ],
    name: 'SwapRequestSentV2',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint64', name: 'dstChainId', type: 'uint64' },
      { indexed: false, internalType: 'uint256', name: 'srcAmount', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'srcToken', type: 'address' }
    ],
    name: 'SwapRequestSentV3',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Unpaused',
    type: 'event'
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'EXECUTOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MANAGER',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address[]', name: '_dexes', type: 'address[]' }],
    name: 'addSupportedDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      { internalType: 'address', name: '_srcBridgeToken', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'bridgeWithSwap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      { internalType: 'address', name: '_srcBridgeToken', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'bridgeWithSwapNative',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'collectedFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    name: 'dstCryptoFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_sender', type: 'address' },
      { internalType: 'uint64', name: '_srcChainId', type: 'uint64' },
      { internalType: 'bytes', name: '_message', type: 'bytes' },
      { internalType: 'address', name: '_executor', type: 'address' }
    ],
    name: 'executeMessage',
    outputs: [
      { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint64', name: '_srcChainId', type: 'uint64' },
      { internalType: 'bytes', name: '_message', type: 'bytes' },
      { internalType: 'address', name: '_executor', type: 'address' }
    ],
    name: 'executeMessageWithTransfer',
    outputs: [
      { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint64', name: '_srcChainId', type: 'uint64' },
      { internalType: 'bytes', name: '_message', type: 'bytes' },
      { internalType: 'address', name: '_executor', type: 'address' }
    ],
    name: 'executeMessageWithTransferFallback',
    outputs: [
      { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'bytes', name: '_message', type: 'bytes' },
      { internalType: 'address', name: '_executor', type: 'address' }
    ],
    name: 'executeMessageWithTransferRefund',
    outputs: [
      { internalType: 'enum IMessageReceiverApp.ExecutionStatus', name: '', type: 'uint8' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'feeRubic',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
    inputs: [],
    name: 'getSupportedDEXes',
    outputs: [{ internalType: 'address[]', name: 'dexes', type: 'address[]' }],
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
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'integratorCollectFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' }
    ],
    name: 'integratorCollectedFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'integratorFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'maxSwapAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'messageBus',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'minSwapAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nativeWrap',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'nonce',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function'
  },
  { inputs: [], name: 'pauseRubic', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'platformShare',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address[]', name: '_dexes', type: 'address[]' }],
    name: 'removeSupportedDex',
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
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'rubicCollectCryptoFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'rubicCollectPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint64', name: '_networkID', type: 'uint64' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'setCryptoFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_integrator', type: 'address' },
      { internalType: 'uint256', name: '_percent', type: 'uint256' }
    ],
    name: 'setIntegrator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'setMaxSwapAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_messageBus', type: 'address' }],
    name: 'setMessageBus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'setMinSwapAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_nativeWrap', type: 'address' }],
    name: 'setNativeWrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_feeRubic', type: 'uint256' }],
    name: 'setRubicFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_integrator', type: 'address' },
      { internalType: 'uint256', name: '_percent', type: 'uint256' }
    ],
    name: 'setRubicShare',
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
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'sweepTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoInch',
        name: '_srcSwap',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'transferWithSwapInch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoInch',
        name: '_srcSwap',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'transferWithSwapInchNative',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoV2',
        name: '_srcSwap',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'transferWithSwapV2',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoV2',
        name: '_srcSwap',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'transferWithSwapV2Native',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'bytes', name: 'path', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoV3',
        name: '_srcSwap',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'transferWithSwapV3',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_amountIn', type: 'uint256' },
      { internalType: 'uint64', name: '_dstChainId', type: 'uint64' },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'bytes', name: 'path', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoV3',
        name: '_srcSwap',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'dex', type: 'address' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'enum SwapBase.SwapVersion', name: 'version', type: 'uint8' },
          { internalType: 'address[]', name: 'path', type: 'address[]' },
          { internalType: 'bytes', name: 'pathV3', type: 'bytes' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' }
        ],
        internalType: 'struct SwapBase.SwapInfoDest',
        name: '_dstSwap',
        type: 'tuple'
      },
      { internalType: 'uint32', name: '_maxBridgeSlippage', type: 'uint32' }
    ],
    name: 'transferWithSwapV3Native',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'txStatusById',
    outputs: [{ internalType: 'enum SwapBase.SwapStatus', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  { inputs: [], name: 'unPauseRubic', outputs: [], stateMutability: 'nonpayable', type: 'function' }
] as AbiItem[];
