import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateModeTab } from '@app/features/privacy/constants/private-mode-tab';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabBarComponent {
  @Input({ required: true }) tabs: PrivateModeTab[] = [];

  @Input() selectedTab: PrivateModeTab;

  @Output() tabClicked: EventEmitter<PrivateModeTab> = new EventEmitter();

  public handleTabClick(tabValue: PrivateModeTab): void {
    this.tabClicked.emit(tabValue);
  }
}
