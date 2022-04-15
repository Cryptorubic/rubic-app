import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Self } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Question } from '../../models/question';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, fromEvent } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent implements AfterViewInit {
  public questions: Question[] = [];

  private anchor: string;

  constructor(
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly element: ElementRef,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.fetchQuestions();
  }

  ngAfterViewInit(): void {
    this.scrollToAnchorItem();
  }

  /**
   * Fetches all questions from i18n file.
   */
  private fetchQuestions(): void {
    combineLatest([this.route.fragment, this.translateService.stream('faqPage.questions')])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([hash, questions]) => {
        this.anchor = hash;
        this.questions = questions.map((question: Question) => ({
          ...question,
          isActive: hash === question.id,
          id: question.id
        }));
      });
  }

  /**
   * Scrolls page to query params anchor.
   */
  private scrollToAnchorItem(): void {
    setTimeout(() => {
      if (this.anchor) {
        const answerElement = this.element.nativeElement.querySelector(`#${this.anchor}`);

        if (!answerElement) {
          return;
        }

        answerElement.scrollIntoView({ behavior: 'smooth' });
        fromEvent(document, 'scroll').pipe(debounceTime(50), takeUntil(this.destroy$)).subscribe();
      }
    }, 200);
  }
}
