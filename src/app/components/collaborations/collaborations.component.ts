import { Component, OnInit } from '@angular/core';

// @ts-ignore
import collaborations from '../../../assets/content/collaborations/collaborations.json';
import {ListingRequestPopupComponent} from './listing-request-popup/listing-request-popup.component';

@Component({
  selector: 'app-collaborations',
  templateUrl: './collaborations.component.html',
  styleUrls: ['./collaborations.component.scss']
})
export class CollaborationsComponent implements OnInit {
  public collaborations = collaborations;

  public isListingRequestPopupShown = false;

  public listingRequestPopupComponentClass = ListingRequestPopupComponent;

  constructor() {}

  ngOnInit() {}
}
