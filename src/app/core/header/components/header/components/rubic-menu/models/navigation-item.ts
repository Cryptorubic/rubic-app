export interface NavigationItem {
  translateKey: string;
  type: 'internal' | 'external';
  link: string;
  imagePath?: string;
  target?: '_self' | '_blank';
  active?: boolean;
}
