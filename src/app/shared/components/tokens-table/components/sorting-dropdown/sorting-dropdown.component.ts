import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-sorting-dropdown',
  templateUrl: './sorting-dropdown.component.html',
  styleUrls: ['./sorting-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortingDropdownComponent {
  @Input() public options: any[];

  @Input() public sortingState: Sort;

  @Input() public whithoutSorting: boolean;

  @Input() public label: string;

  @Output() public sortEvent: EventEmitter<Sort>;

  @Output() public selectEvent: EventEmitter<boolean>;

  public selectedValue: string;

  constructor() {
    this.sortEvent = new EventEmitter<Sort>();
    this.selectEvent = new EventEmitter<boolean>();
    this.selectedValue = 'expires';
  }

  public sortTable(tableColumn?: string): void {
    const newSort = {
      direction: this.sortingState.direction,
      active: tableColumn ?? this.sortingState.active
    } as Sort;
    if (newSort.direction === 'asc') {
      newSort.direction = 'desc';
    } else if (newSort.direction === 'desc') {
      newSort.direction = null;
    } else {
      newSort.direction = 'asc';
    }
    this.sortEvent.emit(newSort);
  }
}
