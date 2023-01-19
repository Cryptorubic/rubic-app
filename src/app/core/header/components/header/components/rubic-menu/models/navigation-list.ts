import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';

const defaultSrc = 'assets/images/icons/navigation/';

export const NAVIGATION_LIST = [
  {
    translateKey: 'navigation.setupWidget',
    type: 'external',
    link: EXTERNAL_LINKS.LANDING_SETUP_WIDGET,
    imagePath: `${defaultSrc}widget.svg`
  },
  {
    translateKey: 'navigation.sdk',
    type: 'external',
    link: EXTERNAL_LINKS.LANDING_SDK,
    imagePath: `${defaultSrc}sdk.svg`
  },
  {
    translateKey: 'navigation.team',
    type: 'external',
    link: EXTERNAL_LINKS.LANDING_TEAM,
    imagePath: `${defaultSrc}team.svg`
  },
  {
    translateKey: 'navigation.faq',
    type: 'internal',
    link: 'faq',
    imagePath: `${defaultSrc}faq.svg`
  },
  {
    translateKey: 'Token Claim',
    type: 'external',
    link: EXTERNAL_LINKS.AIRDROP,
    imagePath: `assets/images/rbc.svg`
  }
] as NavigationItem[];
