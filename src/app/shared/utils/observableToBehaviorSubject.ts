import { BehaviorSubject, Observable } from 'rxjs';

export function observableToBehaviorSubject<T>(
  observable$: Observable<T>,
  initValue: T
): BehaviorSubject<T> {
  const subject$ = new BehaviorSubject(initValue);
  observable$.subscribe(subject$);
  return subject$;
}
