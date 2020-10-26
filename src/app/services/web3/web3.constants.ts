export const CHAIN_OF_NETWORK = {
  1: 'ethereum',
  22: 'binance',
  24: 'matic'
}

export const ETH_NETWORKS = {
  ethereum: {
    INFURA_ADDRESS: 'https://mainnet.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
    ROPSTEN_INFURA_ADDRESS: 'https://ropsten.infura.io/v3/ecf1e6d0427b458b89760012a8500abf',
  },
  binance: {
    INFURA_ADDRESS: 'https://bsc-dataseed1.binance.org',
    ROPSTEN_INFURA_ADDRESS: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  },
  matic: {
    INFURA_ADDRESS: 'https://rpc-mainnet.matic.network',
    ROPSTEN_INFURA_ADDRESS: ' https://rpc-mumbai.maticvigil.com',
  }
};
//
// export const TOKENS_ADDRESSES = {
//   WISH: '0x1b22c32cd936cb97c28c5690a0695a82abf688e6',
//   BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
//   OKB: '0x75231f58b43240c9718dd58b4967c5114342a86c',
//   SWAP: '0xc958e9fb59724f8b0927426a8836f1158f0d03cf', // PROD
//   // SWAP: '0x88c37052d55112ac3CfE2b04d2d5663edCc4b2a4', // TEST
// };

export const ERC20_TOKEN_ABI  = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'version',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
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
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      },
      {
        name: '_extraData',
        type: 'bytes'
      }
    ],
    name: 'approveAndCall',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_spender',
        type: 'address'
      }
    ],
    name: 'allowance',
    outputs: [
      {
        name: 'remaining',
        type: 'uint256'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    inputs: [
      {
        name: '_initialAmount',
        type: 'uint256'
      },
      {
        name: '_tokenName',
        type: 'string'
      },
      {
        name: '_decimalUnits',
        type: 'uint8'
      },
      {
        name: '_tokenSymbol',
        type: 'string'
      }
    ],
    type: 'constructor'
  },
  {
    payable: false,
    type: 'fallback'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address'
      },
      {
        indexed: true,
        name: '_to',
        type: 'address'
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address'
      },
      {
        indexed: true,
        name: '_spender',
        type: 'address'
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: 'event'
  },
];
