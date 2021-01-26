// tslint:disable: max-line-length

import { Component, OnInit } from '@angular/core';

export interface IQuestion {
  isActive: boolean,
  href? : string
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  constructor() {}
  public questions: Array<IQuestion>;

  public ngOnInit(): void {
      // TODO: убрать этот ужас, сделать нормальную инициализацию
    this.questions = [
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
      },
      {
        isActive: false,
        href: "/assets/book.pdf"
      },
        {
            isActive: false,
        },
    ];
  }
}
