/* eslint-disable @angular-eslint/no-host-metadata-property */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-fee-banner',
  templateUrl: './fee-banner.component.html',
  styleUrls: ['./fee-banner.component.scss'],
  host: {
    '[@close]': 'closeAnimationState',
    '(@close.done)': 'handleAnimationEnd()'
  },
  animations: [
    trigger('close', [
      state('untouched', style({ transform: 'translateX(0px)' })),
      state('closed', style({ transform: 'translateX(-1000px)' })),
      transition('untouched => closed', animate('0.3s ease-in-out'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeeBannerComponent {
  private closeAnimationState = 'untouched';

  constructor(private readonly viewContainerRef: ViewContainerRef) {}

  closeBanner(): void {
    this.closeAnimationState = 'closed';
  }

  handleAnimationEnd(): void {
    if (this.closeAnimationState !== 'untouched') {
      this.viewContainerRef.element.nativeElement.parentElement.removeChild(
        this.viewContainerRef.element.nativeElement
      );
    }
  }
}
