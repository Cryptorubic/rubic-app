import { Component } from '@angular/core';
import { QueryParamsService } from '../../../../../core/services/query-params/query-params.service';

@Component({
  selector: 'app-instant-trades',
  templateUrl: './instant-trades.component.html',
  styleUrls: ['./instant-trades.component.scss']
})
export class InstantTradesComponent {
  public readonly $isIframe;

  constructor(queryParamsService: QueryParamsService) {
    this.$isIframe = queryParamsService.$isIframe;
  }
}
