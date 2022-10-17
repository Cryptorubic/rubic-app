/* eslint-disable @typescript-eslint/no-explicit-any */
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { AbiItem } from 'web3-utils';

export const symbiosisPools: any = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      decimals: [6, 6]
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      decimals: [6, 6]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      decimals: [6, 6]
    },
    [BLOCKCHAIN_NAME.BOBA]: {
      blockchain: BLOCKCHAIN_NAME.BOBA,
      address: '0xab0738320A21741f12797Ee921461C691673E276',
      decimals: [6, 6]
    }
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    [BLOCKCHAIN_NAME.AVALANCHE]: {
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      address: '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db',
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db',
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.AURORA]: {
      blockchain: BLOCKCHAIN_NAME.AURORA,
      address: '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8',
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.TELOS]: {
      blockchain: BLOCKCHAIN_NAME.TELOS,
      address: '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8',
      decimals: [6, 18]
    },
    [BLOCKCHAIN_NAME.BOBA]: {
      blockchain: BLOCKCHAIN_NAME.BOBA,
      address: '0xe0ddd7afC724BD4B320472B5C954c0abF8192344',
      decimals: [6, 18]
    }
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    [BLOCKCHAIN_NAME.AURORA]: {
      blockchain: BLOCKCHAIN_NAME.AURORA,
      address: '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4',
      decimals: [6, 6]
    }
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    [BLOCKCHAIN_NAME.POLYGON]: {
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0x3F1bfa6FA3B6D03202538Bf0cdE92BbE551104ac',
      decimals: [6, 6]
    }
  },
  [BLOCKCHAIN_NAME.AURORA]: null,
  [BLOCKCHAIN_NAME.BOBA]: null,
  [BLOCKCHAIN_NAME.TELOS]: null
};

export const symbiosisPoolAbi = [
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'getToken',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'getTokenBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as AbiItem[];
