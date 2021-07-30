import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoreService } from 'src/app/core/services/store/store.service';
import { DOCUMENT } from '@angular/common';

type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject$: BehaviorSubject<Theme>;

  constructor(private readonly store: StoreService, @Inject(DOCUMENT) private document: Document) {
    const localTheme = (this.store.getItem('theme') as Theme) || 'dark';
    this.themeSubject$ = new BehaviorSubject<Theme>(localTheme);

    if (localTheme !== 'dark') {
      this.document.documentElement.classList.toggle('dark');
      this.document.documentElement.classList.toggle('light');
    }
  }

  public getTheme(): Observable<Theme> {
    return this.themeSubject$.asObservable();
  }

  public switchTheme() {
    const isCurrentThemeDark = this.themeSubject$.value === 'dark';
    const nextTheme = isCurrentThemeDark ? 'light' : 'dark';
    this.themeSubject$.next(nextTheme);
    this.store.setItem('theme', nextTheme);

    this.document.documentElement.classList.toggle('dark');
    this.document.documentElement.classList.toggle('light');
  }
}
