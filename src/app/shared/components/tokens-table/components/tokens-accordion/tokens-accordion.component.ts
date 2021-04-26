import { Component, ChangeDetectionStrategy, Input, OnInit, Inject } from '@angular/core';
import { WINDOW } from 'src/app/core/models/window';
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

  constructor(@Inject(WINDOW) private readonly window: Window) {}

  ngOnInit(): void {
    this.linkToTrade = `${this.window.location.host}/trade/${this.data.uniqueLink}`;
  }
}
