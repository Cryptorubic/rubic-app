import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { ZamaSupportedTokens } from '../models/zama-supported-tokens';

export const ZAMA_SUPPORTED_TOKENS: ZamaSupportedTokens = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    {
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      shieldedTokenAddress: '0xe978F22157048E5DB8E5d07971376e86671672B2'
    },
    {
      tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      shieldedTokenAddress: '0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50'
    },
    {
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      shieldedTokenAddress: '0xda9396b82634Ea99243cE51258B6A5Ae512D4893'
    },
    {
      tokenAddress: '0xBA2C598E11eD093079cC324FCa5BbbA99F616E83',
      shieldedTokenAddress: '0x85dE671c3bec1aDeD752c3Cea943521181C826bc'
    },
    {
      shieldedTokenAddress: '0x80CB147Fd86dC6dEe3Eee7e4Cee33d1397d98071',
      tokenAddress: '0xA12CC123ba206d4031D1c7f6223D1C2Ec249f4f3'
    },
    {
      tokenAddress: '0x27f6c8289550fCE67f6B50BeD1F519966aFE5287',
      shieldedTokenAddress: '0xa873750ccBafD5ec7Dd13bfD5237d7129832eDD9'
    },
    {
      shieldedTokenAddress: '0x73cc9aF9d6BEFdb3c3fAf8a5E8c05Cb95FdaEEf1',
      tokenAddress: '0x68749665FF8D2d112Fa859AA293F07A622782F38'
    }
  ]
};
