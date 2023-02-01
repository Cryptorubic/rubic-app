import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-switch-button',
  templateUrl: './switch-button.component.html',
  styleUrls: ['./switch-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchButtonComponent {
  @Output() public readonly handleSwitch = new EventEmitter<() => void>();

  public switchLoading = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public changeNetwork(): void {
    const callback = () => {
      this.switchLoading = false;
      this.cdr.detectChanges();
    };
    this.switchLoading = true;
    this.handleSwitch.emit(callback);
  }
}
