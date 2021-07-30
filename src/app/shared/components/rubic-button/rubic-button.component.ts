import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  OnInit,
  OnDestroy
} from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rubic-button',
  templateUrl: './rubic-button.component.html',
  styleUrls: ['./rubic-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicButtonComponent implements OnInit, OnDestroy {
  @HostBinding('class') @Input('class') classList: string;

  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() size: TuiSizeXS | TuiSizeXL = 'l';

  @Input('bordered') set setBorder(border: boolean | '') {
    this._border = border === '' || border;
  }

  @Input('fullWidth') set fullWidth(fullWidth: boolean | '') {
    this._fullWidth = fullWidth === '' || fullWidth;
  }

  @Input('disabled') set disabled(disabled: boolean | '') {
    this._disabled = disabled === '' || disabled;
  }

  @Input() loading = false;

  @Output() onClick = new EventEmitter<Event>();

  public _border: boolean;

  public _fullWidth: boolean;

  public _disabled = false;

  public themeSubscription$: Subscription;

  constructor(private readonly themeService: ThemeService) {}

  public ngOnInit(): void {
    this.themeSubscription$ = this.themeService.getTheme().subscribe(el => {
      this.classList =
        el === 'dark' ? `${this.classList} dark` : this.classList.replace(' dark', '');
    });
  }

  public ngOnDestroy(): void {
    this.themeSubscription$.unsubscribe();
  }

  public buttonClick(event: Event): void {
    if (!this._disabled) {
      this.onClick.emit(event);
    }
  }
}
