import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';

export const uniSwapContracts = {
  address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  testnetAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
};

export const WETH = {
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnetAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

export const routingProviders = {
  addresses: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
  ],
  testnetAddresses: [
    '0xd0a1e359811322d97991e03f863a0c30c2cf029c', // WETH,
    '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c' // XEENUS
  ]
};

export const maxTransitTokens = 2;

export const tokensToTokensEstimatedGas = [
  new BigNumber(120_000),
  new BigNumber(220_000),
  new BigNumber(300_000)
];

export const tokensToEthEstimatedGas = [
  new BigNumber(150_000),
  new BigNumber(240_000),
  new BigNumber(320_000)
];

export const ethToTokensEstimatedGas = [
  new BigNumber(150_000),
  new BigNumber(240_000),
  new BigNumber(320_000)
];

export const abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_factory',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_WETH',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'WETH',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountADesired',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountBDesired',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountAMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountBMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'addLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountA',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountB',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amountTokenDesired',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountTokenMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETHMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'addLiquidityETH',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountToken',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETH',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'reserveIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'reserveOut',
        type: 'uint256'
      }
    ],
    name: 'getAmountIn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      }
    ],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'reserveIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'reserveOut',
        type: 'uint256'
      }
    ],
    name: 'getAmountOut',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      }
    ],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      }
    ],
    name: 'getAmountsIn',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      }
    ],
    name: 'getAmountsOut',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountA',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'reserveA',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'reserveB',
        type: 'uint256'
      }
    ],
    name: 'quote',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountB',
        type: 'uint256'
      }
    ],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountAMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountBMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'removeLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountA',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountB',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountTokenMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETHMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'removeLiquidityETH',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountToken',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETH',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountTokenMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETHMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'removeLiquidityETHSupportingFeeOnTransferTokens',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountETH',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountTokenMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETHMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: 'approveMax',
        type: 'bool'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'removeLiquidityETHWithPermit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountToken',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETH',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountTokenMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountETHMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: 'approveMax',
        type: 'bool'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountETH',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenA',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'tokenB',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountAMin',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountBMin',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: 'approveMax',
        type: 'bool'
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8'
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'removeLiquidityWithPermit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountA',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountB',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapETHForExactTokens',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapExactETHForTokens',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapExactTokensForETH',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapExactTokensForTokens',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountInMax',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapTokensForExactETH',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'amountInMax',
        type: 'uint256'
      },
      {
        internalType: 'address[]',
        name: 'path',
        type: 'address[]'
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256'
      }
    ],
    name: 'swapTokensForExactTokens',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    stateMutability: 'payable',
    type: 'receive'
  }
] as AbiItem[];
