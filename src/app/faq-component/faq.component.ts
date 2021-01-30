import { Component, OnInit } from '@angular/core';

export interface IQuestion {
  isActive: boolean,
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  constructor() {}
  public questions: Array<IQuestion> = [];
  private questionsNumber = 18;

  public ngOnInit(): void {
    for (let i = 0; i < this.questionsNumber; i++) {
      this.questions.push({ isActive: false })
    }
  }
}
