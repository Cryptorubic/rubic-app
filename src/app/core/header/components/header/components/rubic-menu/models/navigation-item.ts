export interface NavigationItem {
  translateKey: string;
  type: 'internal' | 'external';
  link: string;
  imagePath?: string;
  target?: string;
  active?: boolean;
}
