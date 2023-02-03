import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-revoke-button',
  templateUrl: './revoke-button.component.html',
  styleUrls: ['./revoke-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevokeButtonComponent {
  @Output() public readonly handleRevoke = new EventEmitter<() => void>();

  public revokeLoading = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public revoke(): void {
    const callback = () => {
      this.revokeLoading = false;
      this.cdr.detectChanges();
    };
    this.revokeLoading = true;
    this.handleRevoke.emit(callback);
  }
}
