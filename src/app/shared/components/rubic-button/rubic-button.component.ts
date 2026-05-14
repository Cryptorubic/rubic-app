import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  OnInit,
  Self
} from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-rubic-button',
  templateUrl: './rubic-button.component.html',
  styleUrls: ['./rubic-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RubicButtonComponent implements OnInit {
  @HostBinding('class') @Input('class') classList: string;

  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() size: TuiSizeXS | TuiSizeXL = 'l';

  @Input() pseudoHovered: boolean | null = null;

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

  @Output() onHoveredChange = new EventEmitter<boolean>();

  public _border: boolean;

  public _fullWidth: boolean;

  public _disabled = false;

  public themeSubscription$: Subscription;

  constructor(
    private readonly themeService: ThemeService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this._fullWidth = true;
  }

  public ngOnInit(): void {
    this.handleThemeChange();
  }

  private handleThemeChange(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(el => {
      if (!this.classList) {
        this.classList = '';
      }
      this.classList =
        el === 'dark' ? `${this.classList} dark` : this.classList.replace(' dark', '');
    });
  }

  public buttonClick(event: Event): void {
    if (!this._disabled) {
      this.onClick.emit(event);
    }
  }
}
