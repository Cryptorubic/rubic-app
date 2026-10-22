import {
  NavigationItem,
  SectionItem,
  SectionItemServices
} from '@core/header/components/header/components/rubic-menu/models/navigation-item';
import { EXTERNAL_LINKS, ROUTE_PATH } from '@shared/constants/common/links';

type Section = 'TRADE' | 'REWARDS' | 'SOCIAL' | 'LEGAL & PRIVACY' | 'ABOUT' | 'SUPPORT';

export const NAVIGATION_LIST = [
  {
    translateKey: 'Private Mode',
    type: 'internal',
    getLink: () =>
      `${window.location.origin}?from=ETH&fromChain=ETH&to=USDT&toChain=ETH&amount=1&privateOnly=true`
  },
  {
    translateKey: 'Testnet App',
    type: 'external',
    getLink: () => EXTERNAL_LINKS.TESTNET_APP
  },
  {
    translateKey: 'navigation.about',
    type: 'external',
    getLink: () => EXTERNAL_LINKS.LANDING
  }
] as NavigationItem[];

export const MOBILE_NAVIGATION_LIST: { [key in Section]: SectionItem } = {
  TRADE: {
    children: [
      {
        translateKey: 'Swap',
        type: 'internal',
        getLink: () => ROUTE_PATH.NONE,
        active: false
      },
      {
        translateKey: 'Private Mode',
        type: 'internal',
        getLink: () => ROUTE_PATH.PRIVACY,
        active: false
      },
      {
        translateKey: 'Transfers',
        type: 'external',
        target: '_self',
        getLink: () => {
          if (window.location.href.includes('formType=transfer')) {
            return window.location.href;
          }
          const queryParams = new URLSearchParams(window.location.search).toString();
          return `${window.location.origin}${window.location.pathname}?${queryParams}${queryParams ? '&' : ''}formType=transfer`;
        }
      },
      {
        translateKey: 'Testnets',
        type: 'external',
        getLink: () => EXTERNAL_LINKS.TESTNET_APP
      }
    ]
  },
  REWARDS: {
    onClick: () => window.location.assign(`${window.location.origin}/rewards`),
    children: []
  },
  SOCIAL: {
    children: [
      {
        translateKey: 'Twitter',
        type: 'external',
        getLink: () => 'https://twitter.com/CryptoRubic'
      },
      {
        translateKey: 'Reddit',
        type: 'external',
        getLink: () => 'https://www.reddit.com/r/Rubic/new/'
      },
      {
        translateKey: 'Telegram',
        type: 'external',
        getLink: () => 'https://telegram.me/cryptorubic_chat'
      },
      {
        translateKey: 'Dune',
        type: 'external',
        getLink: () => 'https://dune.com/rubic/rubic-general-dashboard'
      },
      {
        translateKey: 'Mail',
        type: 'external',
        getLink: () => 'mailto:support@rubic.finance'
      },
      {
        translateKey: 'Medium',
        type: 'external',
        getLink: () => 'https://cryptorubic.medium.com/'
      },
      {
        translateKey: 'Discord',
        type: 'external',
        getLink: () => 'https://discord.gg/7EYzPbWKFQ'
      },
      {
        translateKey: 'Coinmarketcap',
        type: 'external',
        getLink: () => 'https://coinmarketcap.com/currencies/rubic'
      },
      {
        translateKey: 'Coingecko',
        type: 'external',
        getLink: () => 'https://www.coingecko.com/en/coins/rubic'
      },
      {
        translateKey: 'Youtube',
        type: 'external',
        getLink: () => 'https://www.youtube.com/c/RubicExchange'
      }
    ]
  },
  ['LEGAL & PRIVACY']: {
    children: [
      {
        translateKey: 'Privacy Policy',
        type: 'external',
        getLink: () => 'https://rubic.exchange/pdf/privacy-policy.pdf'
      },
      {
        translateKey: 'Terms of Use',
        type: 'external',
        getLink: () => 'https://rubic.exchange/pdf/terms-of-use.pdf'
      }
    ]
  },
  ABOUT: {
    onClick: () => window.open('https://rubic.exchange', '_blank'),
    children: []
  },
  SUPPORT: {
    onClick: (services: SectionItemServices) => {
      const action = services.liveChatService.isIframeOpened ? 'hide' : 'show';
      services.liveChatService.toggleLiveChatContainerHeight(action);
    },
    children: []
  }
};
