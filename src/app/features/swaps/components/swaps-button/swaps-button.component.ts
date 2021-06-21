import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  Injector,
  Input,
  ChangeDetectorRef,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';

@Component({
  selector: 'app-swaps-button',
  templateUrl: './swaps-button.component.html',
  styleUrls: ['./swaps-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsButtonComponent implements OnInit {
  @Input() loading = false;

  @Input() disabled: boolean;

  @Output() clickEvent: EventEmitter<void>;

  public isAuthorized: boolean;

  constructor(
    private readonly authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private readonly swapsService: SwapsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.disabled = false;
    this.clickEvent = new EventEmitter<void>();
  }

  public ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.isAuthorized = Boolean(user !== undefined && user !== null && user.address);
      this.cdr.detectChanges();
    });
  }

  public async handleClick(): Promise<void> {
    if (!this.isAuthorized) {
      this.showModal();
    } else if (!this.disabled) {
      this.clickEvent.emit();
    }
  }

  private showModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
  }
}
