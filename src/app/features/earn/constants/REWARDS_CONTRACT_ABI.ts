import { AbiItem } from 'web3-utils';

export const REWARDS_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_ve_', type: 'address' },
      { internalType: 'address', name: 'rewardToken_', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'admin', type: 'address' }],
    name: 'LogAcceptAdmin',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'epochId', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'uint256', name: 'rewardPerSecond', type: 'uint256' },
          { internalType: 'uint256', name: 'totalPower', type: 'uint256' },
          { internalType: 'uint256', name: 'startBlock', type: 'uint256' }
        ],
        indexed: false,
        internalType: 'struct Reward.EpochInfo',
        name: 'epochInfo',
        type: 'tuple'
      }
    ],
    name: 'LogAddEpoch',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'epochLength', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'epochCount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'startEpochId', type: 'uint256' }
    ],
    name: 'LogAddEpoch',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'reward', type: 'uint256' }
    ],
    name: 'LogClaimReward',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'pendingAdmin', type: 'address' }],
    name: 'LogTransferAdmin',
    type: 'event'
  },
  {
    inputs: [],
    name: '_ve',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  { inputs: [], name: 'acceptAdmin', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: 'totalReward', type: 'uint256' }
    ],
    name: 'addEpoch',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'epochLength', type: 'uint256' },
      { internalType: 'uint256', name: 'epochCount', type: 'uint256' },
      { internalType: 'uint256', name: 'totalReward', type: 'uint256' }
    ],
    name: 'addEpochBatch',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'epochId', type: 'uint256' }],
    name: 'checkpointAndCheckEpoch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'startEpoch', type: 'uint256' },
          { internalType: 'uint256', name: 'endEpoch', type: 'uint256' }
        ],
        internalType: 'struct Reward.Interval[]',
        name: 'intervals',
        type: 'tuple[]'
      }
    ],
    name: 'claimReward',
    outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // {
  //   inputs: [
  //     { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
  //     { internalType: 'uint256', name: 'startEpoch', type: 'uint256' },
  //     { internalType: 'uint256', name: 'endEpoch', type: 'uint256' }
  //   ],
  //   name: 'claimReward',
  //   outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
  //   stateMutability: 'nonpayable',
  //   type: 'function'
  // },
  {
    inputs: [
      { internalType: 'uint256[]', name: 'tokenIds', type: 'uint256[]' },
      {
        components: [
          { internalType: 'uint256', name: 'startEpoch', type: 'uint256' },
          { internalType: 'uint256', name: 'endEpoch', type: 'uint256' }
        ],
        internalType: 'struct Reward.Interval[][]',
        name: 'intervals',
        type: 'tuple[][]'
      }
    ],
    name: 'claimRewardMany',
    outputs: [{ internalType: 'uint256[]', name: 'rewards', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'epochInfo',
    outputs: [
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: 'rewardPerSecond', type: 'uint256' },
      { internalType: 'uint256', name: 'totalPower', type: 'uint256' },
      { internalType: 'uint256', name: 'startBlock', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_time', type: 'uint256' }],
    name: 'getBlockByTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_time', type: 'uint256' }],
    name: 'getBlockByTimeWithoutLastCheckpoint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentEpochId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_time', type: 'uint256' }],
    name: 'getEpochIdByTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'epochId', type: 'uint256' }],
    name: 'getEpochInfo',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'epochId', type: 'uint256' }],
    name: 'getEpochStartBlock',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'epochId', type: 'uint256' }],
    name: 'getEpochTotalPower',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'epochId', type: 'uint256' }
    ],
    name: 'getPendingRewardSingle',
    outputs: [
      { internalType: 'uint256', name: 'reward', type: 'uint256' },
      { internalType: 'bool', name: 'finished', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'epochId', type: 'uint256' }
    ],
    name: 'getUserPower',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pendingAdmin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'start', type: 'uint256' },
      { internalType: 'uint256', name: 'end', type: 'uint256' }
    ],
    name: 'pendingReward',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'startEpoch', type: 'uint256' },
          { internalType: 'uint256', name: 'endEpoch', type: 'uint256' },
          { internalType: 'uint256', name: 'reward', type: 'uint256' }
        ],
        internalType: 'struct Reward.IntervalReward[]',
        name: 'intervalRewards',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'point_history',
    outputs: [
      { internalType: 'uint256', name: 'ts', type: 'uint256' },
      { internalType: 'uint256', name: 'blk', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'rewardToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
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
    inputs: [{ internalType: 'address', name: '_admin', type: 'address' }],
    name: 'transferAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'epochId', type: 'uint256' },
      { internalType: 'uint256', name: 'totalReward', type: 'uint256' }
    ],
    name: 'updateEpochReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    name: 'userLastClaimTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as AbiItem[];
