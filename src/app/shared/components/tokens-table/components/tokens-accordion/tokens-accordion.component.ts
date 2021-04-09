import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { TokensTableData } from '../../models/tokens-table-data';

@Component({
  selector: 'app-tokens-accordion',
  templateUrl: './tokens-accordion.component.html',
  styleUrls: ['./tokens-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensAccordionComponent implements OnInit {
  @Input() data: TokensTableData;

  @Input() chainIconPath: string;

  @Input() selectedOption: string;

  public linkToTrade;

  constructor() {}

  ngOnInit(): void {
    this.linkToTrade = `${window.location.host}/trade/${this.data.uniqueLink}`;
  }
}
