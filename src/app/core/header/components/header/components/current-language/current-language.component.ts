import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { languagesList } from 'src/app/core/header/models/languages-list';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-current-language',
  templateUrl: './current-language.component.html',
  styleUrls: ['./current-language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentLanguageComponent {
  public currentLanguage: LanguageListElement;

  constructor(
    private readonly translateService: TranslateService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.currentLanguage = this.getCurrentLang(this.translateService.currentLang);
    this.translateService.onLangChange.pipe(takeUntil(destroy$)).subscribe(currentLang => {
      this.currentLanguage = this.getCurrentLang(currentLang.lang);
      this.cdr.detectChanges();
    });
  }

  public getCurrentLang(currentLng: string): LanguageListElement {
    return languagesList.find(lang => currentLng === lang.lng);
  }
}
