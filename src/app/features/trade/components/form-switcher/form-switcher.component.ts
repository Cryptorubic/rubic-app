import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Component({
  selector: 'app-form-switcher',
  templateUrl: './form-switcher.component.html',
  styleUrls: ['./form-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSwitcherComponent {
  @Output() public readonly switcherClick: EventEmitter<MouseEvent> = new EventEmitter();

  public readonly hideTokenSwitcher = this.queryParamsService.hideTokenSwitcher;

  constructor(private queryParamsService: QueryParamsService) {}
}
