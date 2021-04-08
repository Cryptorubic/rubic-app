import {
  OnChanges,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Type,
  ViewChild,
  HostListener
} from '@angular/core';

import { List } from 'immutable';
import { DropdownComponentData } from './types';

@Component({
  selector: 'app-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrls: ['./input-dropdown.component.scss']
})
/**
 * `T` is the type of the components' data.
 * It must include:
 * 1) `inputs` to pass to the creator of the components
 * 2) unique `id`
 * 3) `sort parameters` are the parameters, which will be used to sort components
 */
export class InputDropdownComponent<T extends DropdownComponentData> implements OnChanges {
  /**
   * The class of the component in the dropdown list.
   */
  @Input() componentClass: Type<any>;

  @Input() private componentsData: List<T> = List();

  @Input() selectedComponentData: T = null;

  @Input() private readonly VISIBLE_COMPONENTS_NUMBER? = 10;

  /**
   * The list of the component class' fields, in order of which the components will be filtered.
   * The first field has the biggest priority.
   */
  @Input() readonly filterBy: string[];

  /**
   * The list of the component class' fields, in order of which the filtered components will be sorted.
   * The first field has the biggest priority.
   */
  @Input() readonly sortBy: string[];

  /**
   * What must be printed, if there's no selected component.
   */
  @Input() chooseComponentText: string;

  @Input() disabled? = false;

  /**
   * if true, then dropdown width will take 100% of its parent, else - 50%.
   */
  @Input() fullWidth? = false;

  /**
   * Emits the event after a component was chosen.
   */
  @Output() componentChanges = new EventEmitter<DropdownComponentData>();

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  public visibleComponentsData = this.componentsData.slice(0, this.VISIBLE_COMPONENTS_NUMBER);

  public isOpenList = false;

  public inputQuery = '';

  // eslint-disable-next-line no-magic-numbers
  public isMobile = window.innerWidth <= 640;

  constructor() {}

  ngOnChanges() {
    if (this.selectedComponentData) {
      this.searchComponent('');
      this.inputQuery = this.selectedComponentData.filterParameters[this.filterBy[0]];
      this.unshiftComponentToVisibleList(
        this.componentsData.find(component => component.id === this.selectedComponentData.id)
      );
    } else {
      this.searchComponent(this.inputQuery);
    }
  }

  public toggleListOpen(isOpen: boolean) {
    this.isOpenList = isOpen;

    if (isOpen) {
      this.searchInput.nativeElement.focus();
    }
  }

  public searchComponent(inputQuery) {
    this.inputQuery = inputQuery;

    const query = inputQuery.toLowerCase();
    const queryMatch: T[] = [];
    this.filterBy.forEach(field =>
      queryMatch.push(
        ...this.componentsData
          .filter(
            token =>
              !queryMatch.includes(token) &&
              (!query || token.filterParameters[field].toLowerCase().includes(query))
          )
          .toArray()
          .sort((a, b) => {
            let compare: number;
            if (this.sortBy) {
              // eslint-disable-next-line
              for (let parameter of this.sortBy) {
                compare = a.sortParameters[parameter] - b.sortParameters[parameter];
                if (compare) {
                  break;
                }
              }
            }
            if (!compare && query) {
              compare = a.filterParameters[field].length - b.filterParameters[field].length;
            }
            return compare;
          })
      )
    );

    this.visibleComponentsData = List(queryMatch.slice(0, this.VISIBLE_COMPONENTS_NUMBER));
  }

  public selectComponent(component: T) {
    this.inputQuery = component.filterParameters[this.filterBy[0]];
    this.unshiftComponentToVisibleList(component);
    this.toggleListOpen(false);

    this.componentChanges.emit(component);
  }

  public clearSearch() {
    this.toggleListOpen(false);
    this.searchComponent('');
    this.componentChanges.emit(null);
  }

  /**
   * Puts the given component to the start of the visible list.
   */
  private unshiftComponentToVisibleList(component: T) {
    if (component) {
      this.visibleComponentsData = this.visibleComponentsData
        .filter(item => item.id !== component.id)
        .slice(0, this.VISIBLE_COMPONENTS_NUMBER - 1)
        .unshift(component);
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    if (this.isOpenList) {
      this.clearSearch();
    }
  }
}
