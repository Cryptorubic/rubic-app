import { Component, Input } from '@angular/core';
import { TotalSupplyOverflowError } from '../../../models/errors/order-book/TotalSupplyOverflowError';

@Component({
  selector: 'app-total-supply-overflow-error',
  templateUrl: './total-supply-overflow-error.component.html',
  styleUrls: ['./total-supply-overflow-error.component.scss']
})
export class TotalSupplyOverflowErrorComponent {
  @Input() totalSupplyOverflowError: TotalSupplyOverflowError;

  constructor() {}
}
