import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss']
})
export class DropdownSelectComponent implements OnInit {
  @Input() public options: any[];

  @Input() private defaultOption: any;

  @Input() public isSortable = false;

  @Input() public downDirection: boolean;

  /**
   * To make selected option and options' list the same width
   */
  @Input() public minOptionWidth: number; // in pixels

  @Output() public onSortBy: EventEmitter<any> = new EventEmitter<any>();

  public areOptionsShown = false;

  public selectedOption: any;

  constructor() {}

  ngOnInit() {
    this.selectedOption = this.options.find(option => option === this.defaultOption);
    this.getArrow();
  }

  public sortByOption(option: any): void {
    this.areOptionsShown = false;
    if (option !== this.selectedOption) {
      this.selectedOption = option;
      this.onSortBy.emit(option);
    }
  }

  public invertSort(): void {
    this.onSortBy.emit(this.selectedOption);
  }

  public getArrow() {
    return this.downDirection ? 'Arrows-down-white.svg' : 'Arrows-up-white.svg';
  }
}
