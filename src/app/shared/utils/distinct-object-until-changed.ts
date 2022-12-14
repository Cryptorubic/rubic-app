import { distinctUntilChanged } from 'rxjs/operators';
import { compareObjects } from '@shared/utils/utils';

export function distinctObjectUntilChanged<T extends object>() {
  return distinctUntilChanged((prev: T, cur: T) => compareObjects(prev, cur));
}
