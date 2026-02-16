import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoreService } from 'src/app/core/services/store/store.service';
import { DOCUMENT } from '@angular/common';

export type Theme = 'dark' | 'light' | 'private';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme$ = new BehaviorSubject<Theme>(this.store.getItem('RUBIC_THEME') || 'dark');

  get theme(): Theme {
    return this._theme$.getValue();
  }

  get theme$(): Observable<Theme> {
    return this._theme$.asObservable();
  }

  constructor(private readonly store: StoreService, @Inject(DOCUMENT) private document: Document) {
    if (this._theme$.value !== 'dark') {
      this.switchDomClass();
    } else {
      document.getElementsByTagName('html')[0].classList.toggle('dark_colored');
    }
  }

  public switchTheme(): void {
    const isCurrentThemeDark = this._theme$.value === 'dark';
    if (isCurrentThemeDark) {
      setTimeout(() => this.processSwitch(isCurrentThemeDark), 100);
    } else {
      setTimeout(() => this.processSwitch(isCurrentThemeDark), 100);
      setTimeout(
        () => document.getElementsByTagName('html')[0].classList.toggle('dark_colored'),
        450
      );
    }
  }

  public setTheme(theme: Theme): void {
    if (theme !== this.theme) {
      this.switchTheme();
    }
  }

  private processSwitch(isCurrentThemeDark: boolean): void {
    const nextTheme = isCurrentThemeDark ? 'private' : 'dark';
    this._theme$.next(nextTheme);
    this.store.setItem('RUBIC_THEME', nextTheme);
    this.switchDomClass();
  }

  private switchDomClass(): void {
    this.document.documentElement.classList.toggle('dark');
    this.document.documentElement.classList.toggle('private');
  }
}

// this.document.documentElement.style.setProperty('--app-background', '#0c0f0c');
// this.document.documentElement.style.setProperty('--io-background', '#101010');
// this.document.documentElement.style.setProperty('--tui-primary', '#05cc81');
// this.document.documentElement.style.setProperty('--tui-secondary', '#191919');
