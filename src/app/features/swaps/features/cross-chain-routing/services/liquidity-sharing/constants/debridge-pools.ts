import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { AbiItem } from 'web3-utils';

export const debridgePools: Partial<Record<BlockchainName, { pool: string; base: string }>> = {
  [BLOCKCHAIN_NAME.ARBITRUM]: {
    pool: '0x76b44e0Cf9bD024dbEd09E1785DF295D59770138',
    base: '0x7f90122BF0700F9E7e1F688fe926940E8839F353'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    pool: '0xDa43Bfd7Ecc6835AA6f1761ced30b986A574c0d2',
    base: '0x445FE580eF8d70FF569aB36e80c647af338db351'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    pool: '0x5A7d2F9595eA00938F3B5BA1f97a85274f20b96c',
    base: '0x160CAed03795365F3A589f10C379FfA7d75d4E76'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    pool: '0xd39016475200ab8957e9C772C949Ef54bDA69111',
    base: '0x7f90122BF0700F9E7e1F688fe926940E8839F353'
  }
};

export const debridgePoolAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'balances',
    inputs: [{ name: 'arg0', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    gas: 3153
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    gas: 318
  }
] as AbiItem[];

export const debridgeBaseAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_virtual_price',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    gas: 2702067
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    gas: 288
  }
] as AbiItem[];
