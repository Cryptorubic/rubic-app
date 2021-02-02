import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Type, ViewChild} from '@angular/core';
import {List} from "immutable";

interface DropdownComponentData {
  inputs: any;
  id: any;
}

@Component({
  selector: 'app-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrls: ['./input-dropdown.component.scss']
})
/**
 * `T` is the type of the components' data.
 * It must include `inputs` to pass to the creator of the components and unique `id`.
 */
export class InputDropdownComponent<T extends DropdownComponentData> implements OnInit {
  /**
   * The class of the component in the list.
   */
  @Input() componentClass: Type<any>;

  @Input() private componentsData: List<T> = List();
  @Input() selectedComponentData: T;
  @Input() private readonly VISIBLE_COMPONENTS_NUMBER? = 10;
  /**
   * The list of the component class' fields, in order of which the components will be sorted.
   * The first field has the biggest priority.
   */
  @Input() readonly sortOrder: string[];

  /**
   * What must be printed, if there's no selected component.
   */
  @Input() chooseComponentText: string;
  @Input() disabled? = false;

  /**
   * Emits the event after a component was chosen.
   */
  @Output() componentChanges = new EventEmitter<DropdownComponentData>();

  @ViewChild('searchInput') searchInput: ElementRef;

  public visibleComponentsData = this.componentsData.slice(0, this.VISIBLE_COMPONENTS_NUMBER);

  public isOpenList = false;
  public inputQuery = '';

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    this.setVisibleComponents();
  }

  public toggleListOpen(isOpen: boolean) {
    this.isOpenList = isOpen;

    if (isOpen) {
      this.searchInput.nativeElement.focus();
    }
  }

  public searchComponent(inputQuery) {
    this.inputQuery = inputQuery;

    if (!inputQuery) {
      this.setVisibleComponents();
    } else {
      const query = inputQuery.toLowerCase();
      const queryMatch: T[] = [];
      this.sortOrder.forEach(field =>
        queryMatch.push(
          ...this.componentsData
            .filter(token => !queryMatch.includes(token) && token[field].toLowerCase().includes(query))
            .toArray()
        )
      );

      this.visibleComponentsData = List(queryMatch.slice(0, this.VISIBLE_COMPONENTS_NUMBER));
    }
  }

  private setVisibleComponents() {
    this.visibleComponentsData = this.componentsData.slice(0, this.VISIBLE_COMPONENTS_NUMBER);
  }

  public selectComponent(component: T) {
    this.inputQuery = component[this.sortOrder[0]];
    this.unshiftComponentToVisibleList(component);
    this.toggleListOpen(false);

    this.componentChanges.emit(component);
  }

  /**
   * Puts the given component to the start of the visible list.
   */
  private unshiftComponentToVisibleList(component: T) {
    this.visibleComponentsData = this.componentsData
      .filter(item => item.id !== component.id)
      .slice(0, this.VISIBLE_COMPONENTS_NUMBER - 1)
      .unshift(component);
  }
}
