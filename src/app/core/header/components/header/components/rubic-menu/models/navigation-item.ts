import { ROUTE_PATH } from '@app/shared/constants/common/links';

export type NavigationItem = {
  translateKey: string;
  imagePath?: string;
  target?: '_self' | '_blank';
  active?: boolean;
} & (
  | {
      type: 'internal';
      link: ROUTE_PATH;
    }
  | { type: 'external'; link: string }
);
