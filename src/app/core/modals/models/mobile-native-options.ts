import { Observable } from 'rxjs';

export interface IMobileNativeOptions {
  title: string;
  forceChangeSize$: Observable<'expand' | 'collapse'>;
}
