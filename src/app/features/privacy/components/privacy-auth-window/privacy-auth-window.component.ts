import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Optional,
  ViewChild
} from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { PrivacyAuthService } from '../../services/privacy-auth.service';
import { waitFor } from '@cryptorubic/web3';
import { Subject } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Component({
  selector: 'app-privacy-auth-window',
  templateUrl: './privacy-auth-window.component.html',
  styleUrls: ['./privacy-auth-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':leave', [style({ opacity: 1 }), animate('0.5s ease-in', style({ opacity: 0 }))])
    ])
  ]
})
export class PrivacyAuthWindowComponent implements AfterViewInit {
  @HostListener('keydown.enter', ['$event'])
  onEnter(): void {
    this.sendCode();
  }

  @HostListener('keydown.escape', ['$event'])
  onEscape(): void {
    this.closeWindow();
  }

  @ViewChild('inputRef') inputRef: ElementRef;

  private readonly _validationSuccess$ = new Subject<boolean>();

  public readonly validationSuccess$ = this._validationSuccess$.asObservable();

  public readonly refCodeCtrl = this.privacyAuthService.refCodeCtrl;

  public prevSentCode: string | null = null;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<{ valid: boolean; forceClosed: boolean }>,
    private readonly privacyAuthService: PrivacyAuthService,
    private readonly notificationService: NotificationsService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.inputRef.nativeElement?.focus(), 500);
  }

  public async sendCode(): Promise<void> {
    if (this.prevSentCode === this.privacyAuthService.refCode) return;

    const valid = await this.privacyAuthService.validateCode(this.privacyAuthService.refCode);
    this.prevSentCode = this.privacyAuthService.refCode;
    this._validationSuccess$.next(valid);
    if (!valid) this.notificationService.showInvalidPrivacyCodeWarning();
    await waitFor(2_000);
    if (valid) this.context.completeWith({ valid, forceClosed: false });
  }

  public closeWindow(): void {
    this.context.completeWith({ valid: false, forceClosed: true });
  }
}
