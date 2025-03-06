import { NavigationItem } from '@core/header/components/header/components/rubic-menu/models/navigation-item';
import { EXTERNAL_LINKS, ROUTE_PATH } from '@shared/constants/common/links';

const defaultSrc = 'assets/images/icons/navigation/';

type Section = 'Trade' | 'More' | 'Social' | 'Legal & Privacy';

export const NAVIGATION_LIST = [
  {
    translateKey: 'Swap & Earn',
    type: 'internal',
    link: ROUTE_PATH.AIRDROP,
    imagePath: `assets/images/rbc.svg`
  },
  {
    translateKey: 'Token Claim',
    type: 'external',
    link: EXTERNAL_LINKS.AIRDROP,
    imagePath: `assets/images/rbc.svg`
  },
  {
    translateKey: 'navigation.sdk',
    type: 'external',
    link: EXTERNAL_LINKS.LANDING_SDK,
    imagePath: `${defaultSrc}sdk.svg`
  },
  {
    translateKey: 'navigation.setupWidget',
    type: 'external',
    link: EXTERNAL_LINKS.LANDING_SETUP_WIDGET,
    imagePath: `${defaultSrc}widget.svg`
  },
  {
    translateKey: 'navigation.about',
    type: 'external',
    link: EXTERNAL_LINKS.LANDING,
    imagePath: `${defaultSrc}team.svg`
  },
  {
    translateKey: 'navigation.retrodrop',
    type: 'internal',
    link: 'retrodrop',
    target: '_blank',
    imagePath: `${defaultSrc}retrodrop.svg`
  }
] as NavigationItem[];

export const MOBILE_NAVIGATION_LIST: { [key in Section]: NavigationItem[] } = {
  ['Trade']: [
    {
      translateKey: 'Swap',
      type: 'internal',
      link: ROUTE_PATH.NONE,
      active: false
    },
    {
      translateKey: 'Staking',
      type: 'internal',
      link: ROUTE_PATH.STAKING,
      active: false
    },
    {
      translateKey: 'Swap to Earn',
      type: 'internal',
      link: ROUTE_PATH.AIRDROP,
      active: false
    },
    {
      translateKey: 'Retrodrop',
      type: 'internal',
      link: ROUTE_PATH.RETRODROP,
      active: false
    }
  ],
  ['More']: [
    {
      translateKey: 'Testnet App',
      type: 'external',
      link: EXTERNAL_LINKS.TESTNET_APP
    },
    {
      translateKey: 'Documentation',
      type: 'external',
      link: 'https://docs.rubic.finance/rubic/introduction'
    },
    {
      translateKey: 'SDK',
      type: 'external',
      link: 'https://tools.rubic.exchange/sdk'
    },
    {
      translateKey: 'Widget',
      type: 'external',
      link: 'https://tools.rubic.exchange/widget'
    },
    {
      translateKey: 'About',
      type: 'external',
      link: EXTERNAL_LINKS.LANDING
    }
  ],
  ['Social']: [
    {
      translateKey: 'Facebook',
      type: 'external',
      link: 'https://www.facebook.com/RubicDEX/'
    },
    {
      translateKey: 'Twitter',
      type: 'external',
      link: 'https://twitter.com/CryptoRubic'
    },
    {
      translateKey: 'Reddit',
      type: 'external',
      link: 'https://www.reddit.com/r/Rubic/new/'
    },
    {
      translateKey: 'Telegram',
      type: 'external',
      link: 'https://t.me/cryptorubic_chat'
    },
    {
      translateKey: 'Dune',
      type: 'external',
      link: 'https://dune.com/rubic_exchange/rubic-general-dashboard'
    },
    {
      translateKey: 'Mail',
      type: 'external',
      link: 'mailto:support@rubic.finance'
    },
    {
      translateKey: 'Medium',
      type: 'external',
      link: 'https://cryptorubic.medium.com/'
    },
    {
      translateKey: 'Discord',
      type: 'external',
      link: 'https://discord.gg/7EYzPbWKFQ'
    },
    {
      translateKey: 'Coinmarketcap',
      type: 'external',
      link: 'https://coinmarketcap.com/currencies/rubic'
    },
    {
      translateKey: 'Coingecko',
      type: 'external',
      link: 'https://www.coingecko.com/en/coins/rubic'
    },
    {
      translateKey: 'Youtube',
      type: 'external',
      link: 'https://www.youtube.com/c/RubicExchange'
    },
    {
      translateKey: 'Coinmarketcap',
      type: 'external',
      link: 'https://www.defipulse.com/'
    }
  ],
  ['Legal & Privacy']: [
    {
      translateKey: 'Privacy Policy',
      type: 'external',
      link: 'https://rubic.exchange/pdf/privacy-policy.pdf'
    },
    {
      translateKey: 'Terms of Use',
      type: 'external',
      link: 'https://rubic.exchange/pdf/terms-of-use.pdf'
    }
  ]
};
