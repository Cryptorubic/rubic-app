import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Local shim replacing TuiDestroyService removed from @taiga-ui/cdk in v4.
 * Emits and completes when the host component/service is destroyed.
 * Usage: inject as provider, then pipe(takeUntil(this.destroy$))
 */
@Injectable()
export class TuiDestroyService extends Observable<void> implements OnDestroy {
  private readonly subject$ = new Subject<void>();

  constructor() {
    super(subscriber => this.subject$.subscribe(subscriber));
  }

  ngOnDestroy(): void {
    this.subject$.next();
    this.subject$.complete();
  }
}
