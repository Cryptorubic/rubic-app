import { RoundContract } from '../models/round-contract.interface';
import { AbiItem } from 'web3-utils';

export const STAKING_ROUND_THREE: {
  TEST_TOKEN: RoundContract;
  NFT: RoundContract;
  REWARDS: RoundContract;
} = {
  TEST_TOKEN: {
    address: '',
    abi: []
  },
  NFT: {
    address: '0x3BBF11E07cE979769da5f263Cb4f66dC88B5bBea',
    abi: [
      {
        inputs: [{ internalType: 'address', name: 'token_addr', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
          { indexed: true, internalType: 'address', name: 'approved', type: 'address' },
          { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
        ],
        name: 'Approval',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
          { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
          { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' }
        ],
        name: 'ApprovalForAll',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'address', name: 'provider', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
          { indexed: true, internalType: 'uint256', name: 'locktime', type: 'uint256' },
          {
            indexed: false,
            internalType: 'enum ve.DepositType',
            name: 'deposit_type',
            type: 'uint8'
          },
          { indexed: false, internalType: 'uint256', name: 'ts', type: 'uint256' }
        ],
        name: 'Deposit',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: false, internalType: 'uint256', name: 'prevSupply', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'supply', type: 'uint256' }
        ],
        name: 'Supply',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'address', name: 'from', type: 'address' },
          { indexed: true, internalType: 'address', name: 'to', type: 'address' },
          { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
        ],
        name: 'Transfer',
        type: 'event'
      },
      {
        anonymous: false,
        inputs: [
          { indexed: true, internalType: 'address', name: 'provider', type: 'address' },
          { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
          { indexed: false, internalType: 'uint256', name: 'ts', type: 'uint256' }
        ],
        name: 'Withdraw',
        type: 'event'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'abstain',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_approved', type: 'address' },
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'attach',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'attachments',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'uint256', name: '_block', type: 'uint256' }
        ],
        name: 'balanceOfAtNFT',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'balanceOfNFT',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'uint256', name: '_t', type: 'uint256' }
        ],
        name: 'balanceOfNFTAt',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'block_number',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'checkpoint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_value', type: 'uint256' },
          { internalType: 'uint256', name: '_lock_duration', type: 'uint256' }
        ],
        name: 'create_lock',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_value', type: 'uint256' },
          { internalType: 'uint256', name: '_lock_duration', type: 'uint256' },
          { internalType: 'address', name: '_to', type: 'address' }
        ],
        name: 'create_lock_for',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'uint256', name: '_value', type: 'uint256' }
        ],
        name: 'deposit_for',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'detach',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [],
        name: 'epoch',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'finishStaking',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [],
        name: 'finishedStaking',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'getApproved',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'get_last_user_slope',
        outputs: [{ internalType: 'int128', name: '', type: 'int128' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'uint256', name: '_value', type: 'uint256' }
        ],
        name: 'increase_amount',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'uint256', name: '_lock_duration', type: 'uint256' }
        ],
        name: 'increase_unlock_time',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_owner', type: 'address' },
          { internalType: 'address', name: '_operator', type: 'address' }
        ],
        name: 'isApprovedForAll',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_spender', type: 'address' },
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
        ],
        name: 'isApprovedOrOwner',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'locked',
        outputs: [
          { internalType: 'int128', name: 'amount', type: 'int128' },
          { internalType: 'uint256', name: 'end', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'locked__end',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_from', type: 'uint256' },
          { internalType: 'uint256', name: '_to', type: 'uint256' }
        ],
        name: 'merge',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'nftSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'ownership_change',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'point_history',
        outputs: [
          { internalType: 'int128', name: 'bias', type: 'int128' },
          { internalType: 'int128', name: 'slope', type: 'int128' },
          { internalType: 'uint256', name: 'ts', type: 'uint256' },
          { internalType: 'uint256', name: 'blk', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_from', type: 'address' },
          { internalType: 'address', name: '_to', type: 'address' },
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' }
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_from', type: 'address' },
          { internalType: 'address', name: '_to', type: 'address' },
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'bytes', name: '_data', type: 'bytes' }
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_operator', type: 'address' },
          { internalType: 'bool', name: '_approved', type: 'bool' }
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'address', name: '_voter', type: 'address' }],
        name: 'setVoter',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'slope_changes',
        outputs: [{ internalType: 'int128', name: '', type: 'int128' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'supply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'bytes4', name: '_interfaceID', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'token',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'address', name: '_owner', type: 'address' },
          { internalType: 'uint256', name: '_tokenIndex', type: 'uint256' }
        ],
        name: 'tokenOfOwnerByIndex',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'totalNFTSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_block', type: 'uint256' }],
        name: 'totalSupplyAt',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: 't', type: 'uint256' }],
        name: 'totalSupplyAtT',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
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
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'user_point_epoch',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '', type: 'uint256' },
          { internalType: 'uint256', name: '', type: 'uint256' }
        ],
        name: 'user_point_history',
        outputs: [
          { internalType: 'int128', name: 'bias', type: 'int128' },
          { internalType: 'int128', name: 'slope', type: 'int128' },
          { internalType: 'uint256', name: 'ts', type: 'uint256' },
          { internalType: 'uint256', name: 'blk', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
          { internalType: 'uint256', name: '_idx', type: 'uint256' }
        ],
        name: 'user_point_history__ts',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'version',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'voted',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'voter',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
        name: 'voting',
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
    ] as AbiItem[]
  },
  REWARDS: {
    address: '0xF9f0331C98c8Dc122BF722784fC60646B47250b2',
    abi: [
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
        inputs: [
          { indexed: false, internalType: 'address', name: 'pendingAdmin', type: 'address' }
        ],
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
      {
        inputs: [],
        name: 'acceptAdmin',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
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
      {
        inputs: [
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'startEpoch', type: 'uint256' },
          { internalType: 'uint256', name: 'endEpoch', type: 'uint256' }
        ],
        name: 'claimReward',
        outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
      },
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
    ] as AbiItem[]
  }
};
