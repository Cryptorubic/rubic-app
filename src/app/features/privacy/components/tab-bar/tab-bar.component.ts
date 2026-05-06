import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrivateModeTab } from '@app/features/privacy/constants/private-mode-tab';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { PRIVATE_TAB_TO_FLOW_TYPE_EVENT } from '@core/services/google-tag-manager/models/google-tag-manager';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TabBarComponent {
  @Input({ required: true }) tabs: PrivateModeTab[] = [];

  @Input() selectedTab: PrivateModeTab;

  @Output() tabClicked: EventEmitter<PrivateModeTab> = new EventEmitter();

  constructor(private readonly gtmService: GoogleTagManagerService) {}

  public handleTabClick(tabValue: PrivateModeTab): void {
    if (tabValue !== this.selectedTab) {
      this.gtmService.fireSelectPrivateFlowTabEvent(PRIVATE_TAB_TO_FLOW_TYPE_EVENT[tabValue]);
    }
    this.tabClicked.emit(tabValue);
  }
}
