import { Observable } from 'rxjs';
import { PrivateSwapOptions } from './preview-swap-options';

export type PreviewSwapModalFactory = (options: PrivateSwapOptions) => Observable<void>;
