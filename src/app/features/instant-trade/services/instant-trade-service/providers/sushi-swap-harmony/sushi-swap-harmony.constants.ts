import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';

export const WONE = {
  address: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', // WONE https://explorer.harmony.one/
  testnetAddress: 'one1cqeqx6z3fdukzftdv27hhjvyvg7q7lm9yhykcm' // WONE https://explorer.pops.one/
};

export const routingProviders = {
  addresses: [
    '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', // WONE
    '0xef977d2f931c1978db5f6747666fa1eacb0d0339', // DAI
    '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', // USDT
    '0x3095c7557bcb296ccc6e363de01b760ba031f2d9' // WBTC
  ],
  testnetAddresses: [
    'one1cqeqx6z3fdukzftdv27hhjvyvg7q7lm9yhykcm' // WONE
  ]
};

export const maxTransitTokens = 2;

export const tokensToTokensEstimatedGas = [
  new BigNumber(120_000),
  new BigNumber(120_000),
  new BigNumber(120_000),
  new BigNumber(120_000)
];

export const tokensToEthEstimatedGas = [
  new BigNumber(150_000),
  new BigNumber(150_000),
  new BigNumber(150_000),
  new BigNumber(150_000)
];

export const ethToTokensEstimatedGas = [
  new BigNumber(150_000),
  new BigNumber(150_000),
  new BigNumber(150_000),
  new BigNumber(150_000)
];

export const sushiSwapHarmonyContracts = {
  address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnetAddress: '0x5546e0295c7bb85b2fC00883B6025BA0Db06e50A'
};

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
