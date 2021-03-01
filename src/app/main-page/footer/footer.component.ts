import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-main-page',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterMainPageComponent {
  constructor() {}

  public onSubmit(form) {
    form.submit();
  }
}
