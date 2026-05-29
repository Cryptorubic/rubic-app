import { Abi } from 'viem';

export const evmCommonCrossChainAbi: Abi = [
  {
    inputs: [],
    name: 'fixedNativeFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '_fixedNativeFee',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address'
      }
    ],
    name: 'integratorToFeeInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'isIntegrator',
            type: 'bool'
          },
          {
            internalType: 'uint32',
            name: 'tokenFee',
            type: 'uint32'
          },
          {
            internalType: 'uint32',
            name: 'RubicTokenShare',
            type: 'uint32'
          },
          {
            internalType: 'uint32',
            name: 'RubicFixedCryptoShare',
            type: 'uint32'
          },
          {
            internalType: 'uint128',
            name: 'fixedFeeAmount',
            type: 'uint128'
          }
        ],
        internalType: 'struct IFeesFacet.IntegratorFeeInfo',
        name: '_info',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'RubicPlatformFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '_RubicPlatformFee',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'transactionId',
            type: 'bytes32'
          },
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'integrator',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'referrer',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'refundee',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool'
          }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'firstSwapCalldata',
            type: 'bytes'
          },
          {
            internalType: 'bytes',
            name: 'secondSwapCalldata',
            type: 'bytes'
          },
          {
            internalType: 'address',
            name: 'intermediateToken',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'bridgingToken',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'firstDexRouter',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'secondDexRouter',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'relayRecipient',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'otherSideCalldata',
            type: 'bytes'
          }
        ],
        internalType: 'struct SymbiosisFacet.SymbiosisData',
        name: '_symbiosisData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaSymbiosis',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [
          { internalType: 'bytes', name: 'firstSwapCalldata', type: 'bytes' },
          { internalType: 'bytes', name: 'secondSwapCalldata', type: 'bytes' },
          { internalType: 'address', name: 'intermediateToken', type: 'address' },
          { internalType: 'address', name: 'bridgingToken', type: 'address' },
          { internalType: 'address', name: 'firstDexRouter', type: 'address' },
          { internalType: 'address', name: 'secondDexRouter', type: 'address' },
          { internalType: 'address', name: 'relayRecipient', type: 'address' },
          { internalType: 'bytes', name: 'otherSideCalldata', type: 'bytes' }
        ],
        internalType: 'struct SymbiosisFacet.SymbiosisData',
        name: '_symbiosisData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaSymbiosis',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [{ internalType: 'address', name: 'router', type: 'address' }],
        internalType: 'struct MultichainFacet.MultichainData',
        name: '_multichainData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaMultichain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'anyNative', type: 'address' },
      { internalType: 'address[]', name: 'routers', type: 'address[]' }
    ],
    name: 'initMultichain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'routers', type: 'address[]' },
      { internalType: 'bool[]', name: 'allowed', type: 'bool[]' }
    ],
    name: 'registerRouters',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [{ internalType: 'address', name: 'router', type: 'address' }],
        internalType: 'struct MultichainFacet.MultichainData',
        name: '_multichainData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaMultichain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_transactionId', type: 'bytes32' },
      { internalType: 'address', name: '_integrator', type: 'address' },
      { internalType: 'address', name: '_referrer', type: 'address' },
      { internalType: 'address payable', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_minAmount', type: 'uint256' },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      }
    ],
    name: 'swapTokensGeneric',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'transactionId',
            type: 'bytes32'
          },
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'integrator',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'referrer',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'refundee',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool'
          }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          },
          {
            internalType: 'bool',
            name: 'requiresDeposit',
            type: 'bool'
          }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'dstPoolId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'minAmountLD',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'dstGasForCall',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'lzFee',
            type: 'uint256'
          },
          {
            internalType: 'address payable',
            name: 'refundAddress',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'callTo',
            type: 'bytes'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct StargateFacet.StargateData',
        name: '_stargateData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaStargate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'transactionId',
            type: 'bytes32'
          },
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'integrator',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'referrer',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'refundee',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool'
          }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'dstPoolId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'minAmountLD',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'dstGasForCall',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'lzFee',
            type: 'uint256'
          },
          {
            internalType: 'address payable',
            name: 'refundAddress',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'callTo',
            type: 'bytes'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct StargateFacet.StargateData',
        name: '_stargateData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaStargate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'toChainToken', type: 'address' },
          {
            internalType: 'uint256',
            name: 'expectedToChainTokenAmount',
            type: 'uint256'
          },
          { internalType: 'uint32', name: 'slippage', type: 'uint32' }
        ],
        internalType: 'struct XYFacet.XYData',
        name: '_xyData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaXY',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [
          { internalType: 'address', name: 'toChainToken', type: 'address' },
          {
            internalType: 'uint256',
            name: 'expectedToChainTokenAmount',
            type: 'uint256'
          },
          { internalType: 'uint32', name: 'slippage', type: 'uint32' }
        ],
        internalType: 'struct XYFacet.XYData',
        name: '_xyData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaXY',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'approvedDexs',
    outputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'transactionId',
            type: 'bytes32'
          },
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'integrator',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'referrer',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'refundee',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool'
          }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'router',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct GenericCrossChainFacet.GenericCrossChainData',
        name: '_genericData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaGenericCrossChain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'transactionId',
            type: 'bytes32'
          },
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'integrator',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'referrer',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'refundee',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool'
          }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'sendingAssetId',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          },
          {
            internalType: 'bool',
            name: 'requiresDeposit',
            type: 'bool'
          }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'router',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes'
          }
        ],
        internalType: 'struct GenericCrossChainFacet.GenericCrossChainData',
        name: '_genericData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaGenericCrossChain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_contract', type: 'address' }],
    name: 'isContractApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes4', name: '_signature', type: 'bytes4' }],
    name: 'isFunctionApproved',
    outputs: [{ internalType: 'bool', name: 'approved', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_router', type: 'address' },
      { internalType: 'bytes4', name: '_selector', type: 'bytes4' }
    ],
    name: 'getSelectorInfo',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'isAvailable', type: 'bool' },
          { internalType: 'uint256', name: 'offset', type: 'uint256' }
        ],
        internalType: 'struct LibMappings.ProviderFunctionInfo',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          }
        ],
        internalType: 'struct TransferAndCallData',
        name: '_transferAndCallData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaTransferAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          }
        ],
        internalType: 'struct TransferAndCallData',
        name: '_transferAndCallData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaTransferAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [{ internalType: 'address payable', name: 'destination', type: 'address' }],
        internalType: 'struct TransferFacet.TransferData',
        name: '_transferData',
        type: 'tuple'
      }
    ],
    name: 'startBridgeTokensViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' }
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          { internalType: 'address', name: 'receivingAssetId', type: 'address' },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' }
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]'
      },
      {
        components: [{ internalType: 'address payable', name: 'destination', type: 'address' }],
        internalType: 'struct TransferFacet.TransferData',
        name: '_transferData',
        type: 'tuple'
      }
    ],
    name: 'swapAndStartBridgeTokensViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
];
