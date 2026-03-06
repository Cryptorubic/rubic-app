import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabBarComponent implements OnInit {
  @Input({ required: true }) tabs: string[] = [];

  @Output() tabClicked: EventEmitter<string> = new EventEmitter();

  public selectedTab: string;

  ngOnInit(): void {
    this.selectedTab = this.tabs[0];
  }

  public handleTabClick(tabValue: string): void {
    this.tabClicked.emit(tabValue);
    this.selectedTab = tabValue;
  }
}
