import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';

interface TitleDescription {
  title: string;
  description: string;
}

interface Roadmap {
  month?: string;
  quarter: string;
  done: boolean;
  data: string[];
}

@Component({
  selector: 'app-about-page',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutPageComponent {
  public $isMobile: Observable<boolean>;

  public benefits: TitleDescription[];

  public features: string[];

  public roadmap: Roadmap[];

  constructor(
    private readonly translateService: TranslateService,
    private readonly headerStore: HeaderStore
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    const benefitsTranslateKey = 'aboutPage.benefits';
    const featuresTranslateKey = 'aboutPage.features.data';
    const roadmapTranslateKey = 'aboutPage.roadmap.data';
    this.translateService
      .stream([benefitsTranslateKey, featuresTranslateKey, roadmapTranslateKey])
      .subscribe(translations => {
        this.benefits = Object.values(translations[benefitsTranslateKey]).map(
          (benefit: TitleDescription) => benefit
        );
        this.features = Object.values(translations[featuresTranslateKey]);
        this.roadmap = Object.values(translations[roadmapTranslateKey]).map(
          (roadmap: Roadmap) => roadmap
        );
      });
  }
}
