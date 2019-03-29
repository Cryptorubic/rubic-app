import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss']
})
export class StartFormComponent implements OnInit {
  public tokensData;
  constructor() {
    const draftData = localStorage.getItem('form_values');
    this.tokensData = draftData ? JSON.parse(draftData) : {
      base: {
        token: {}
      },
      quote: {
        token: {}
      }
    };
  }

  public changedToken() {
    localStorage.setItem('form_values', JSON.stringify(this.tokensData));
  }

  ngOnInit() {
  }

}
