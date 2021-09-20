import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-header-settings',
  templateUrl: './header-settings.component.html',
  styleUrls: ['./header-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSettingsComponent {
  /**
   * @description title of header
   */
  @Input() title: string;

  /**
   * @description have header back button or not
   */
  @Input() haveBackButton: boolean;

  /**
   * @description event emitter on click close button
   */
  @Output() closeClick = new EventEmitter();

  /**
   * @description event emitter on click back button
   */
  @Output() backClick = new EventEmitter();

  constructor() {}
}
