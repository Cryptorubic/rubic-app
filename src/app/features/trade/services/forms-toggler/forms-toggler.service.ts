import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from './models';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { AuthService } from '@app/core/services/auth/auth.service';

@Injectable()
export class FormsTogglerService {
  private _selectedForm$ = new BehaviorSubject<MainFormType>(MAIN_FORM_TYPE.SWAP_FORM);

  public readonly selectedForm$ = this._selectedForm$.asObservable();

  public get selectedForm(): MainFormType {
    return this._selectedForm$.value;
  }

  constructor(
    private readonly themeService: ThemeService,
    private readonly authService: AuthService
  ) {
    if (this.themeService.theme === 'private') {
      this._selectedForm$.next(MAIN_FORM_TYPE.PRIVATE_SWAP_FORM);
    }
  }

  public toogleForm(type: MainFormType): void {
    if (type !== this.selectedForm) {
      this._selectedForm$.next(type);
      const nextTheme =
        type !== MAIN_FORM_TYPE.SWAP_FORM && type !== MAIN_FORM_TYPE.DEPOSIT ? 'private' : 'dark';
      const currTheme = this.themeService.theme;

      this.themeService.setTheme(nextTheme);
      if (nextTheme !== currTheme) {
        this.authService.disconnectWallet();
      }
    }
  }
}
