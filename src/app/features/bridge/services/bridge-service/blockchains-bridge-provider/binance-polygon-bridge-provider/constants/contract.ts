import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const EVO_ADDRESSES = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xe3D2C41d1769D5359D83624bEe73e9EEeb3EDa7F',
  [BLOCKCHAIN_NAME.POLYGON]: '0x833eb1646d814cadd8eb516b5dfea0a6f17584c8'
};

export const EVO_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'uint8', name: 'dstFrom', type: 'uint8' }
    ],
    name: 'OrderCompleted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'bytes32', name: 'target', type: 'bytes32' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
          { internalType: 'uint8', name: 'destination', type: 'uint8' },
          { internalType: 'address', name: 'tokenIn', type: 'address' },
          { internalType: 'bytes32', name: 'tokenOut', type: 'bytes32' }
        ],
        indexed: false,
        internalType: 'struct Bridge.Order',
        name: 'order',
        type: 'tuple'
      }
    ],
    name: 'OrderCreated',
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
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'addresses',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256[]', name: '_orderIds', type: 'uint256[]' }],
    name: 'closeManyOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'orderId', type: 'uint256' }],
    name: 'closeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'orderId', type: 'uint256' },
          { internalType: 'uint8', name: 'dstFrom', type: 'uint8' },
          { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
          { internalType: 'address payable', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'decimals', type: 'uint256' },
          { internalType: 'contract ERC20', name: 'tokenOut', type: 'address' },
          { internalType: 'address[]', name: 'swapPath', type: 'address[]' }
        ],
        internalType: 'struct Bridge.CompleteParams[]',
        name: 'params',
        type: 'tuple[]'
      }
    ],
    name: 'completeManyOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'orderId', type: 'uint256' },
      { internalType: 'uint8', name: 'dstFrom', type: 'uint8' },
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'address payable', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'decimals', type: 'uint256' },
      { internalType: 'contract ERC20', name: 'tokenOut', type: 'address' },
      { internalType: 'address[]', name: 'swapPath', type: 'address[]' }
    ],
    name: 'completeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'completed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: '', type: 'uint8' },
      { internalType: 'uint8', name: '', type: 'uint8' }
    ],
    name: 'configs',
    outputs: [
      { internalType: 'uint16', name: 'fee', type: 'uint16' },
      { internalType: 'uint256', name: 'feeBase', type: 'uint256' },
      { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'maxAmount', type: 'uint256' },
      { internalType: 'bool', name: 'directTransferAllowed', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'bytes32', name: 'target', type: 'bytes32' }
    ],
    name: 'create',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract ERC20', name: 'tokenIn', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'bytes32', name: 'target', type: 'bytes32' },
      { internalType: 'bytes32', name: 'tokenOut', type: 'bytes32' },
      { internalType: 'address[]', name: 'swapPath', type: 'address[]' }
    ],
    name: 'createWithSwap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'orderId', type: 'uint256' },
      { internalType: 'uint8', name: 'dstFrom', type: 'uint8' }
    ],
    name: 'isCompleted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'listOrders',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'bytes32', name: 'target', type: 'bytes32' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
          { internalType: 'uint8', name: 'destination', type: 'uint8' },
          { internalType: 'address', name: 'tokenIn', type: 'address' },
          { internalType: 'bytes32', name: 'tokenOut', type: 'bytes32' }
        ],
        internalType: 'struct Bridge.Order[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'listTokensNames',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'orders',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'bytes32', name: 'target', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
      { internalType: 'uint8', name: 'decimals', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'address', name: 'tokenIn', type: 'address' },
      { internalType: 'bytes32', name: 'tokenOut', type: 'bytes32' }
    ],
    stateMutability: 'view',
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
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint256', name: 'bonus', type: 'uint256' }
    ],
    name: 'setBonus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      {
        components: [
          { internalType: 'uint16', name: 'fee', type: 'uint16' },
          { internalType: 'uint256', name: 'feeBase', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'maxAmount', type: 'uint256' },
          { internalType: 'bool', name: 'directTransferAllowed', type: 'bool' }
        ],
        internalType: 'struct Bridge.Config',
        name: 'config',
        type: 'tuple'
      }
    ],
    name: 'setConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint16', name: 'defaultFee', type: 'uint16' }
    ],
    name: 'setDefaultFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint256', name: 'defaultFeeBase', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'setDefaultFeeBase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint256', name: 'defaultMaxAmount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'setDefaultMaxAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint256', name: 'defaultMinAmount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'setDefaultMinAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'bool', name: 'directTransferAllowed', type: 'bool' }
    ],
    name: 'setDirectTransferAllowed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'uint16', name: 'fee', type: 'uint16' }
    ],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'uint256', name: 'feeBase', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'setFeeBase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'address', name: 'feeTarget', type: 'address' }
    ],
    name: 'setFeeTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'uint256', name: 'maxAmount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'setMaxAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'uint8', name: 'destination', type: 'uint8' },
      { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'setMinAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bool', name: 'allowed', type: 'bool' },
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' }
    ],
    name: 'setSwapSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'contract IBridgeSwap', name: 'newSwapper', type: 'address' }],
    name: 'setSwapper',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'contract ERC20', name: 'token', type: 'address' },
      { internalType: 'address', name: 'feeTarget', type: 'address' },
      { internalType: 'uint16', name: 'defaultFee', type: 'uint16' },
      { internalType: 'uint256', name: 'defaultFeeBase', type: 'uint256' },
      { internalType: 'uint256', name: 'defaultMinAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'defaultMaxAmount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' },
      { internalType: 'uint256', name: 'bonus', type: 'uint256' }
    ],
    name: 'setToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bool', name: 'isTrusted', type: 'bool' }
    ],
    name: 'setTrusted',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'swapDefaultTokenId',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'swapper',
    outputs: [{ internalType: 'contract IBridgeSwap', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'swapsAllowed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    name: 'tokens',
    outputs: [
      { internalType: 'contract ERC20', name: 'token', type: 'address' },
      { internalType: 'address', name: 'feeTarget', type: 'address' },
      { internalType: 'uint16', name: 'defaultFee', type: 'uint16' },
      { internalType: 'uint256', name: 'defaultFeeBase', type: 'uint256' },
      { internalType: 'uint256', name: 'defaultMinAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'defaultMaxAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'bonus', type: 'uint256' }
    ],
    stateMutability: 'view',
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
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'trusted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'tokenId', type: 'uint8' },
      { internalType: 'address payable', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract ERC20', name: 'token', type: 'address' },
      { internalType: 'address payable', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint8', name: 'inputDecimals', type: 'uint8' }
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  { stateMutability: 'payable', type: 'receive' }
];
