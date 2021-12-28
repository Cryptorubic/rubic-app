import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { LanguagesList } from '@core/header/models/languages-list';

@Component({
  selector: 'app-current-language',
  templateUrl: './current-language.component.html',
  styleUrls: ['./current-language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CurrentLanguageComponent implements OnInit {
  public currentLanguage: LanguageListElement;

  constructor(
    private readonly translateService: TranslateService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.currentLanguage = this.getCurrentLanguage(this.translateService.currentLang);
  }

  public ngOnInit(): void {
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(currentLang => {
      this.currentLanguage = this.getCurrentLanguage(currentLang.lang);
      this.cdr.detectChanges();
    });
  }

  /**
   * Gets current language.
   * @param CurrentLang code of current language.
   */
  private getCurrentLanguage(currentLang: string): LanguageListElement {
    return LanguagesList.find(lang => lang.lng === currentLang);
  }
}
