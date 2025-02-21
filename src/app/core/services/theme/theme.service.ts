import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoreService } from 'src/app/core/services/store/store.service';
import { DOCUMENT } from '@angular/common';

export type Theme = 'dark' | 'light';

export type MainBgTheme = 'dark' | 'light' | 'monad';
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme$ = new BehaviorSubject<Theme>(this.store.getItem('RUBIC_THEME') || 'dark');

  private _mainBgTheme$ = new BehaviorSubject<MainBgTheme>(this.theme);

  public mainBgTheme$ = this._mainBgTheme$.asObservable();

  public setMainBgTheme(bgTheme: MainBgTheme): void {
    if (bgTheme !== this._mainBgTheme$.getValue()) {
      this._mainBgTheme$.next(bgTheme);
      if (bgTheme === 'monad') {
        this.document.documentElement.style.setProperty(
          '--app-background',
          `url('assets/images/monad-testnet-bg.svg')`
        );
      } else if (bgTheme === 'dark') {
        this.document.documentElement.style.setProperty('--app-background', '#282935');
      } else {
        this.document.documentElement.style.setProperty('--app-background', '#fff');
      }
    }
  }

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
    const nextTheme = isCurrentThemeDark ? 'light' : 'dark';
    this._theme$.next(nextTheme);
    this.store.setItem('RUBIC_THEME', nextTheme);
    this.switchDomClass();
  }

  private switchDomClass(): void {
    this.document.documentElement.classList.toggle('dark');
    this.document.documentElement.classList.toggle('light');
  }
}
