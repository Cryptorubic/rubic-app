import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-listing-request-popup',
  templateUrl: './listing-request-popup.component.html',
  styleUrls: ['./listing-request-popup.component.scss']
})
export class ListingRequestPopupComponent {
  public informtation: string[];

  constructor(private readonly translateService: TranslateService) {
    this.translateService.get('tradesPage.listingRequest.information').subscribe(informtation => {
      this.informtation = Object.values(informtation);
    });
  }
}
