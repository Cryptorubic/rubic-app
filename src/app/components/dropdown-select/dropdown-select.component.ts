import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss']
})
export class DropdownSelectComponent implements OnInit {
  @Input() public options: any[];
  @Input() private defaultOption = 0;
  @Input() public isSortable = false;
  @Input() public downDirection: boolean;
  /* To make selected option and options' list the same width */
  @Input() public minOptionWidth: number; // in pixels

  @Output() public optionToSortBy: EventEmitter<any> = new EventEmitter<any>();

  public isOptionsShown = false;
  public selectedOption: any;

  constructor() { }

  ngOnInit() {
    this.selectedOption = this.options[this.defaultOption];
    this.getArrow();
  }

  public sortByOption(option: any): void {
    this.selectedOption = option;
    this.isOptionsShown = false;
    this.optionToSortBy.emit(option);
  }

  public invertSort(): void {
    this.optionToSortBy.emit(this.selectedOption);
  }

  public getArrow() {
    return this.downDirection ? 'Arrows-down-white.svg' : 'Arrows-up-white.svg';
  }
}
