import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';

/**
 * Info icon with hint on hover
 */
@Component({
  selector: 'app-info-hint',
  templateUrl: './info-hint.component.html',
  styleUrls: ['./info-hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoHintComponent {
  /**
   * Translation key for text in the hint.
   */
  @Input() translationKey: string;

  /**
   * Icon style. 'default' styled icon is green, 'error' styled icon is red.
   */
  @Input() style: 'default' | 'error' = 'default';

  /**
   * Icon size in pixels. Default size is 15px.
   */
  @Input() size = 15;

  @HostBinding('style.height') get height(): string {
    return `${this.size}px`;
  }

  constructor() {}
}
