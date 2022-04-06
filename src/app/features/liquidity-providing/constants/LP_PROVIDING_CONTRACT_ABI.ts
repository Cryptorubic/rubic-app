import { AbiItem } from 'web3-utils';

export const LP_PROVIDING_CONTRACT_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'userReward', type: 'uint256' }
    ],
    name: 'ClaimRewards',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'requestAddress', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountUSDC', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountBRBC', type: 'uint256' }
    ],
    name: 'RequestWithdraw',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amountUsdc', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountBrbc', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'period', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'Stake',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountUSDC', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amountBRBC', type: 'uint256' }
    ],
    name: 'Withdraw',
    type: 'event'
  },
  {
    inputs: [],
    name: 'apr',
    outputs: [{ internalType: 'uint256', name: 'aprNum', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'collectedRewardsForToken',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'endTime',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'infoAboutDepositsParsed',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'USDCAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'BRBCAmount', type: 'uint256' },
          { internalType: 'uint32', name: 'startTime', type: 'uint32' },
          { internalType: 'uint32', name: 'deadline', type: 'uint32' },
          { internalType: 'bool', name: 'isStaked', type: 'bool' },
          { internalType: 'bool', name: 'isWhitelisted', type: 'bool' },
          { internalType: 'uint256', name: 'lastRewardGrowth', type: 'uint256' }
        ],
        internalType: 'struct RubicLP.TokenLP[]',
        name: 'parsedArrayOfTokens',
        type: 'tuple[]'
      },
      { internalType: 'uint256[]', name: 'collectedRewards', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'rewardsToCollect', type: 'uint256[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amountUSDC', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'stakingInfoParsed',
    outputs: [
      { internalType: 'uint256', name: 'amountToCollectTotal', type: 'uint256' },
      { internalType: 'uint256', name: 'amountCollectedTotal', type: 'uint256' },
      { internalType: 'uint256', name: 'aprInfo', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'stakingProgressParsed',
    outputs: [
      { internalType: 'uint256', name: 'yourTotalUSDC', type: 'uint256' },
      { internalType: 'uint256', name: 'totalUSDCInPoolWhitelist', type: 'uint256' },
      { internalType: 'uint256', name: 'totalUSDCInPool', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'startTime',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'tokensLP',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'USDCAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'BRBCAmount', type: 'uint256' },
      { internalType: 'uint32', name: 'startTime', type: 'uint32' },
      { internalType: 'uint32', name: 'deadline', type: 'uint32' },
      { internalType: 'bool', name: 'isStaked', type: 'bool' },
      { internalType: 'bool', name: 'isWhitelisted', type: 'bool' },
      { internalType: 'uint256', name: 'lastRewardGrowth', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'viewApprovedWithdrawToken',
    outputs: [{ internalType: 'bool', name: 'readyForWithdraw', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'viewCollectedRewards',
    outputs: [{ internalType: 'uint256', name: 'rewardForTokenClaimed', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'viewCollectedRewardsTotal',
    outputs: [{ internalType: 'uint256', name: 'totalCollectedRewardsAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'viewRewards',
    outputs: [{ internalType: 'uint256', name: 'rewardAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'viewRewardsTotal',
    outputs: [{ internalType: 'uint256', name: 'totalRewardsAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'viewTokensByOwner',
    outputs: [{ internalType: 'uint256[]', name: 'tokenList', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'viewTotalEntered',
    outputs: [
      { internalType: 'uint256', name: 'totalPoolUSDC', type: 'uint256' },
      { internalType: 'uint256', name: 'totalPoolBRBC', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'viewUSDCAmountOf',
    outputs: [{ internalType: 'uint256', name: 'USDCAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'viewWhitelistInProgress',
    outputs: [{ internalType: 'bool', name: 'isInProgress', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amountUSDC', type: 'uint256' }],
    name: 'whitelistStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];
