import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TokensTableData } from '../../../models/tokens-table-data';

@Component({
  selector: 'app-tokens-accordion',
  templateUrl: './tokens-accordion.component.html',
  styleUrls: ['./tokens-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensAccordionComponent {
  @Input() data: TokensTableData;

  @Input() chainIconPath: string;

  @Input() selectedOption: string;

  constructor() {}
}
