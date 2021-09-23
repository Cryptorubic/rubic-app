import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-header-settings',
  templateUrl: './header-settings.component.html',
  styleUrls: ['./header-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSettingsComponent {
  /**
   * title of header
   */
  @Input() title: string;

  /**
   * have header back button or not
   */
  @Input() haveBackButton: boolean;

  /**
   * event emitter on click close button
   */
  @Output() closeClick = new EventEmitter();

  /**
   * event emitter on click back button
   */
  @Output() backClick = new EventEmitter();

  constructor() {}
}
