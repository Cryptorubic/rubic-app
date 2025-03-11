import { AbiItem } from 'web3-utils';

export const PUMP_CONTRACT = '0x096f6df3d0dB9617771C4689338a8d663810140c';

export const PUMP_ABI = [
  //   {
  //     inputs: [
  //       { internalType: 'string', name: 'name', type: 'string' },
  //       { internalType: 'string', name: 'symbol', type: 'string' },
  //       { internalType: 'string', name: 'desc', type: 'string' },
  //       { internalType: 'string', name: 'img', type: 'string' },
  //       {
  //         components: [
  //           { internalType: 'string', name: 'Twitter', type: 'string' },
  //           { internalType: 'string', name: 'Telegram', type: 'string' },
  //           { internalType: 'string', name: 'Youtube', type: 'string' },
  //           { internalType: 'string', name: 'Website', type: 'string' }
  //         ],
  //         internalType: 'tuple[]',
  //         name: 'urls',
  //         type: 'tuple[]'
  //       },
  //       { internalType: 'uint256', name: 'initAmount', type: 'uint256' },
  //       { internalType: 'address', name: 'referral', type: 'address' }
  //     ],
  //     name: 'pump',
  //     outputs: [],
  //     stateMutability: 'payable',
  //     type: 'function'
  //   },
  //   {
  //     inputs: [
  //       { internalType: 'string', name: 'name', type: 'string' },
  //       { internalType: 'string', name: 'symbol', type: 'string' },
  //       { internalType: 'string', name: 'desc', type: 'string' },
  //       { internalType: 'string', name: 'img', type: 'string' },
  //       {
  //         components: [
  //           { internalType: 'string', name: 'Twitter', type: 'string' },
  //           { internalType: 'string', name: 'Telegram', type: 'string' },
  //           { internalType: 'string', name: 'Youtube', type: 'string' },
  //           { internalType: 'string', name: 'Website', type: 'string' }
  //         ],
  //         internalType: 'tuple[]',
  //         name: 'urls',
  //         type: 'tuple[]'
  //       },
  //       { internalType: 'address', name: 'referral', type: 'address' }
  //     ],
  //     name: 'pumpWithETH',
  //     outputs: [],
  //     stateMutability: 'payable',
  //     type: 'function'
  //   },
  {
    name: 'buyToken',
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];
