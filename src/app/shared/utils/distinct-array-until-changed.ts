import { distinctUntilChanged } from 'rxjs/operators';

export function distinctArrayUntilChanged() {
  return distinctUntilChanged((prev, cur) => {
    if (!Array.isArray(prev) || !Array.isArray(cur) || prev.length !== cur.length) {
      return prev === cur;
    }
    return prev.every((item, index) => item === cur[index]);
  });
}
