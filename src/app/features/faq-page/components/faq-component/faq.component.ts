import { AfterViewInit, Component, OnInit } from '@angular/core';

export interface IQuestion {
  isActive: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, AfterViewInit {
  public questions: Array<IQuestion> = [];

  private questionsNumber = 26;

  private questionsHTMLTexts;

  constructor() {}

  public ngOnInit(): void {
    for (let i = 0; i < this.questionsNumber; i++) {
      this.questions.push({ isActive: false });
    }
  }

  ngAfterViewInit() {
    this.questionsHTMLTexts = document.querySelectorAll('.questions-container__text');
  }

  public makeQuestionActive(question, index) {
    question.isActive = !question.isActive;
    if (question.isActive) {
      this.questionsHTMLTexts[
        index
      ].style.height = `${this.questionsHTMLTexts[index].scrollHeight}px`;
    } else {
      this.questionsHTMLTexts[index].style.height = 0;
    }
  }
}
