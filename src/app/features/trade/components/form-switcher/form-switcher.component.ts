import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { combineLatestWith, map } from 'rxjs';
import { MAIN_FORM_TYPE } from '../../services/forms-toggler/models';

@Component({
  selector: 'app-form-switcher',
  templateUrl: './form-switcher.component.html',
  styleUrls: ['./form-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSwitcherComponent {
  @Output() public readonly switcherClick: EventEmitter<MouseEvent> = new EventEmitter();

  public readonly showTokenSwitcher$ = this.formsTogglerService.selectedForm$.pipe(
    combineLatestWith(this.queryParamsService.queryParams$),
    map(
      ([selectedForm, params]) =>
        !params.hideTokenSwitcher && selectedForm === MAIN_FORM_TYPE.SWAP_FORM
    )
  );

  public disabled: boolean = false;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly formsTogglerService: FormsTogglerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public onClick(): void {
    this.disabled = true;
    this.switcherClick.emit();
    setTimeout(() => {
      this.disabled = false;
      this.cdr.markForCheck();
    }, 2000);
  }
}
