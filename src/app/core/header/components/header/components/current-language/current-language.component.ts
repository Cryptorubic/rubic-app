import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { languagesList } from 'src/app/core/header/models/languages-list';
import { LanguageListElement } from 'src/app/core/header/models/language-list-element';

@Component({
  selector: 'app-current-language',
  templateUrl: './current-language.component.html',
  styleUrls: ['./current-language.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentLanguageComponent {
  public get currentLanguage(): LanguageListElement {
    return languagesList.find(lang => this.translateService.currentLang === lang.lng);
  }

  constructor(private readonly translateService: TranslateService) {}
}
