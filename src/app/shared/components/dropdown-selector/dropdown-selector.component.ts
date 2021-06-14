import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  QueryList,
  TemplateRef,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-dropdown-selector',
  templateUrl: './dropdown-selector.component.html',
  styleUrls: ['./dropdown-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownSelectorComponent {
  @Input() dropdownButtonTemplate: TemplateRef<any>;

  @Input() dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  @Output() optionChange = new EventEmitter<number>();

  @Output() opened = new EventEmitter<boolean>();

  public open = false;

  constructor() {}

  public onOptionClick(optionIndex: number): void {
    this.open = false;
    this.optionChange.emit(optionIndex);
  }

  public openChange(opened) {
    this.opened.emit(opened);
  }
}
