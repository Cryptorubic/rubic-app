import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { Faucet } from '@features/faucets/models/faucet';

export const defaultFaucets: Partial<Record<BlockchainName, Faucet[]>> = {
  [BLOCKCHAIN_NAME.GOERLI]: [
    {
      token: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        icon_url:
          'https://assets.rubic.exchange/assets/goerli/0x0000000000000000000000000000000000000000/logo.png'
      },
      url: 'https://goerlifaucet.com/',
      name: 'Ether'
    }
  ],
  [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: [
    {
      token: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        icon_url:
          'https://assets.rubic.exchange/assets/scroll-sepolia-testnet/0x0000000000000000000000000000000000000000/logo.png'
      },
      url: 'https://sepolia-faucet.pk910.de/',
      name: 'Ether'
    }
  ],
  [BLOCKCHAIN_NAME.ARTHERA]: [
    {
      token: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'AA',
        icon_url:
          'https://assets.rubic.exchange/assets/scroll-sepolia-testnet/0x0000000000000000000000000000000000000000/logo.png'
      },
      url: 'https://sepolia-faucet.pk910.de/',
      name: 'Arthera'
    }
  ]
};
