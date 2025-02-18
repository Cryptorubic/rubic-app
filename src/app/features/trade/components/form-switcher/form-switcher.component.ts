import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-form-switcher',
  templateUrl: './form-switcher.component.html',
  styleUrls: ['./form-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSwitcherComponent {
  @Output() public readonly switcherClick: EventEmitter<MouseEvent> = new EventEmitter();

  public readonly showTokenSwitcher$ = this.queryParamsService.queryParams$.pipe(
    map(params => !params.hideTokenSwitcher)
  );

  public disabled: boolean = false;

  constructor(
    private readonly queryParamsService: QueryParamsService,
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
