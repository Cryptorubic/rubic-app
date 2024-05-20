import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainFilter } from '../../models/BlockchainFilters';

@Component({
  selector: 'app-filter-list-element',
  templateUrl: './filter-list-element.component.html',
  styleUrls: ['./filter-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterListElementComponent {
  @Input({ required: true }) blockchainFilter!: BlockchainFilter;

  @Input({ required: true }) isClicked: boolean;
}
