import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Question } from '../../models/question';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  public questions: Question[];

  constructor(private readonly translateService: TranslateService) {
    this.translateService.stream('faqPage.questions').subscribe(questions => {
      this.questions = Object.values(questions).map((question: Question) => ({
        isActive: false,
        ...question
      }));
    });
  }

  public toggleQuestion(containerElement: MouseEvent, question: Question) {
    const answerElement = (containerElement.currentTarget as HTMLElement)
      .children[1] as HTMLElement;
    console.log(answerElement, answerElement.offsetHeight, answerElement.scrollHeight);
    question.isActive = !question.isActive;
    if (question.isActive) {
      answerElement.style.height = `${answerElement.scrollHeight}px`;
    } else {
      answerElement.style.height = '0';
    }
  }
}
