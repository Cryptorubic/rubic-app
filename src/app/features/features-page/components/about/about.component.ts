import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';

interface TitleDescription {
  title: string;
  description: string;
}

interface Quartal {
  title: string;
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

  public roadmap: {
    q1: Quartal;
    q2: Quartal;
    q3: Quartal;
    q4: Quartal;
  };

  constructor(
    private readonly translateService: TranslateService,
    private readonly headerStore: HeaderStore
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    const benefitsTranslateKey = 'aboutPage.benefits';
    const featuresTranslateKey = 'aboutPage.features.data';
    const roadmapTranslateKey = 'aboutPage.roadmap.data';
    this.translateService
      .get([benefitsTranslateKey, featuresTranslateKey, roadmapTranslateKey])
      .subscribe(translations => {
        this.benefits = Object.values(translations[benefitsTranslateKey]).map(
          (benefit: TitleDescription) => benefit
        );
        this.features = Object.values(translations[featuresTranslateKey]);
        const roadmapValue = translations[roadmapTranslateKey];
        this.roadmap = {
          q1: {
            title: roadmapValue.q1.title,
            data: Object.values(roadmapValue.q1.data)
          },
          q2: {
            title: roadmapValue.q2.title,
            data: Object.values(roadmapValue.q2.data)
          },
          q3: {
            title: roadmapValue.q3.title,
            data: Object.values(roadmapValue.q3.data)
          },
          q4: {
            title: roadmapValue.q4.title,
            data: Object.values(roadmapValue.q4.data)
          }
        };
      });
  }
}
