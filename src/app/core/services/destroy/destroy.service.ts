import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

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
