import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Question } from '../../models/question';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements AfterViewInit {
  public questions: Question[] = [];

  private hash: string;

  constructor(
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly element: ElementRef,
    private readonly destroy$: TuiDestroyService
  ) {
    combineLatest([this.route.fragment, this.translateService.stream('faqPage.questions')])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([hash, questions]) => {
        this.hash = hash;
        this.questions = questions.map(
          (question: { title: string; answer: string; id: string }) => ({
            ...question,
            isActive: hash === question.id,
            id: question.id
          })
        );
      });
  }

  public ngAfterViewInit(): void {
    if (this.hash) {
      const answerElement = this.element.nativeElement.querySelector(`#${this.hash}`);
      answerElement.scrollIntoView(true);
    }
    return;
  }

  public toggleQuestion(question: Question): void {
    question.isActive = !question.isActive;
  }
}
