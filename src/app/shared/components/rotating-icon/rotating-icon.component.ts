import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Inject,
  OnChanges
} from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';
import { NgChanges } from '@shared/models/utility-types/ng-changes';

/**
 * Rotating icon with smooth rotation completion.
 */
@Component({
  selector: 'app-rotating-icon',
  templateUrl: './rotating-icon.component.html',
  styleUrls: ['./rotating-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotatingIconComponent implements OnChanges {
  /**
   * Icon image source. Default is reload arrows.
   */
  @Input() image = 'assets/images/icons/reload.svg';

  /**
   * Should rotate image.
   */
  @Input() rotating = false;

  /**
   * Should disable button.
   */
  @Input() disabled = false;

  /**
   * Emits when user clicks on the icon-button.
   */
  @Output() iconClick = new EventEmitter<void>();

  @ViewChild('icon', { static: true }) icon: ElementRef;

  public stopAnimation: 'rotating' | 'graduallyStop' | 'stopped' = 'stopped';

  constructor(@Inject(WINDOW) private window: Window) {}

  ngOnChanges(changes: NgChanges<RotatingIconComponent>) {
    if (changes.rotating?.currentValue && !changes.rotating?.previousValue) {
      this.animate();
    }
  }

  private animate(): void {
    const start = performance.now();
    const roundTime = 1000;
    const degAtMs = 360 / roundTime;
    let animationIteration = 0;

    const animationCallback = (time: number) => {
      const currentTime = time > start ? time - start : 0;
      const currentAngle = Math.round((currentTime * degAtMs) % 360);
      const currentIteration = Math.floor((currentTime * degAtMs) / 360);

      if (!this.rotating && currentIteration > animationIteration) {
        this.setIconRotation(0, 'left');
        return;
      }

      animationIteration = currentIteration;
      this.setIconRotation(currentAngle, 'left');
      this.window.requestAnimationFrame(animationCallback);
    };

    this.window.requestAnimationFrame(animationCallback);
  }

  private setIconRotation(deg: number, direction: 'right' | 'left' = 'right'): void {
    deg = direction === 'left' ? deg * -1 : deg;
    this.icon.nativeElement.style.transform = `rotate(${deg}deg)`;
  }

  public onClick(): void {
    this.iconClick.emit();
  }
}
