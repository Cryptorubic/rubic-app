import { AbiItem } from 'web3-utils';

export const LP_PROVIDING_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_tokenAddrUSDC', type: 'address' },
      { internalType: 'address', name: '_tokenAddrBRBC', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'AddRewards',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'Approve',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'Burn',
    type: 'event'
  },
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
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'userReward', type: 'uint256' }
    ],
    name: 'FromClaimRewards',
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
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' }
    ],
    name: 'RoleAdminChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
    ],
    name: 'RoleGranted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' }
    ],
    name: 'RoleRevoked',
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
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'Transfer',
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
    name: 'BRBC',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MANAGER',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'USDC',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'addRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_spender', type: 'address' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    name: 'approvedWithdrawToken',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
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
    name: 'crossChain',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'endTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'fromClaimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_withdrawAddress', type: 'address[]' },
      { internalType: 'uint256[]', name: '_tokenIds', type: 'uint256[]' }
    ],
    name: 'fundRequestsForWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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
          { internalType: 'uint256', name: 'lastRewardGrowth', type: 'uint256' }
        ],
        internalType: 'struct Staking.TokenLP[]',
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
    inputs: [],
    name: 'maxPoolBRBC',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maxPoolUSDC',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maxUSDCAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'minUSDCAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'penalty',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'penaltyReciver',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'poolBRBC',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'poolUSDC',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'rate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'requestWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'rewardGrowth',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_crossChain', type: 'address' }],
    name: 'setCrossChainAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_maxPoolBRBC', type: 'uint256' }],
    name: 'setMaxPoolBRBC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_maxPoolUSDC', type: 'uint256' }],
    name: 'setMaxPoolUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_maxUSDCAmount', type: 'uint256' }],
    name: 'setMaxUSDCAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_minUSDCAmount', type: 'uint256' }],
    name: 'setMinUSDCAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_penalty', type: 'uint256' }],
    name: 'setPenalty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_penaltyAddress', type: 'address' }],
    name: 'setPenaltyAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_rate1Month', type: 'uint256' },
      { internalType: 'uint256', name: '_rate3Month', type: 'uint256' },
      { internalType: 'uint256', name: '_rate6Month', type: 'uint256' }
    ],
    name: 'setRates',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_startTime', type: 'uint256' },
      { internalType: 'uint256', name: '_endTime', type: 'uint256' }
    ],
    name: 'setTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_amountUSDC', type: 'uint256' },
      { internalType: 'uint32', name: '_period', type: 'uint32' }
    ],
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
      { internalType: 'uint256', name: 'totalUSDCInPool', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'startTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'timeBeforeUnlock',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'tokenApprovals',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'tokenToOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
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
      { internalType: 'uint256', name: 'lastRewardGrowth', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalPoolStakedUSDC',
    outputs: [{ internalType: 'uint256', name: 'poolOfUSDC', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_from', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_approvedAddress', type: 'address' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
    ],
    name: 'viewApprovedWithdrawToken',
    outputs: [{ internalType: 'bool', name: 'isApproved', type: 'bool' }],
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
    inputs: [],
    name: 'viewRequestArray',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_from', type: 'address' },
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
    ],
    name: 'viewRequests',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'viewTokenOwner',
    outputs: [{ internalType: 'address', name: 'tokenOwner', type: 'address' }],
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
    inputs: [{ internalType: 'address', name: '_tokenOwner', type: 'address' }],
    name: 'viewUSDCAmountOf',
    outputs: [{ internalType: 'uint256', name: 'USDCAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    name: 'withdrawRequest',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_tokenAddresses', type: 'address[]' },
      { internalType: 'uint256[]', name: '_tokenAmounts', type: 'uint256[]' },
      { internalType: 'address', name: '_to', type: 'address' }
    ],
    name: 'withdrawToOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as AbiItem[];
