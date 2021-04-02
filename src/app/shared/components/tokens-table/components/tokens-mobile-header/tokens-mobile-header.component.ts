import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-tokens-mobile-header',
  templateUrl: './tokens-mobile-header.component.html',
  styleUrls: ['./tokens-mobile-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensMobileHeaderComponent {
  public sortingOptions: string[];

  public selectionOptions: string[];

  @Input() public sortingValue: Sort;

  @Output() public sortEvent: EventEmitter<Sort>;

  @Output() public selectEvent: EventEmitter<string>;

  @Input() public selectedValue: string;

  private readonly sortableColumns: string[];

  @Input() set sortingColumns(columns: string[]) {
    this.sortingOptions = columns.reduce((acc, column: string) => {
      return this.sortableColumns.includes(column) ? [...acc, column] : acc;
    }, [] as string[]);
  }

  constructor() {
    this.sortEvent = new EventEmitter<Sort>();
    this.selectEvent = new EventEmitter<string>();
    this.sortableColumns = ['Expires in', 'Status'];
    this.selectionOptions = ['From', 'To', 'Spent', 'Expected', 'Expires in'];
  }

  public sortTable(tableColumn: MatSelectChange): void {
    const newSort = { direction: this.sortingValue.direction, active: tableColumn.value } as Sort;
    this.sortEvent.emit(newSort);
  }

  public changeDirection(): void {
    const newSort = {
      direction: this.sortingValue.direction,
      active: this.sortingValue.active
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

  public selectColumn(tableColumn: MatSelectChange): void {
    this.selectEvent.emit(tableColumn.value);
  }
}
