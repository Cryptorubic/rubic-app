import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { PrivateModeTab } from '@app/features/privacy/constants/private-mode-tab';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabBarComponent implements OnInit {
  @Input({ required: true }) tabs: PrivateModeTab[] = [];

  @Output() tabClicked: EventEmitter<PrivateModeTab> = new EventEmitter();

  public selectedTab: PrivateModeTab;

  ngOnInit(): void {
    this.selectedTab = this.tabs[0];
  }

  public handleTabClick(tabValue: PrivateModeTab): void {
    this.tabClicked.emit(tabValue);
    this.selectedTab = tabValue;
  }
}
