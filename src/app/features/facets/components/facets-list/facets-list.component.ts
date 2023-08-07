import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Facet } from '@features/facets/models/facet';

@Component({
  selector: 'app-facets-list',
  templateUrl: './facets-list.component.html',
  styleUrls: ['./facets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacetsListComponent {
  @Input() facets: Facet[] | null;

  constructor() {
    setTimeout(() => {
      console.log(this.facets);
    }, 1000);
  }
}
