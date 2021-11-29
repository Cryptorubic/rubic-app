import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { ROUTE_PATH } from '@shared/constants/common/links';

const defaultSrc = 'assets/images/icons/navigation/';

export const NAVIGATION_LIST = [
  {
    translateKey: 'navigation.about',
    type: 'external',
    link: ROUTE_PATH.LANDING,
    imagePath: `${defaultSrc}about.svg`
  },
  {
    translateKey: 'Fiat on-ramp',
    type: 'internal',
    link: 'buy-crypto',
    imagePath: `${defaultSrc}fiat.svg`
  },
  {
    translateKey: 'navigation.faq',
    type: 'internal',
    link: 'faq',
    imagePath: `${defaultSrc}faq.svg`
  },
  {
    translateKey: 'navigation.team',
    type: 'internal',
    link: 'team',
    imagePath: `${defaultSrc}team.svg`
  },
  {
    translateKey: 'navigation.merch',
    type: 'external',
    link: 'https://shop.rubic.exchange',
    imagePath: `${defaultSrc}shop.svg`
  }
] as NavigationItem[];
