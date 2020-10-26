// tslint:disable: max-line-length

import { Component, OnInit } from '@angular/core';

export interface IQuestion {
  isActive: boolean;
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
    ];
  }
}
