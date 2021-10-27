import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewContainerRef,
  Renderer2
} from '@angular/core';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent implements AfterViewInit {
  @Input() searchQuery: string;

  @Output() searchQueryChange = new EventEmitter<string>();

  constructor(private readonly viewRef: ViewContainerRef, private readonly renderer: Renderer2) {}

  public ngAfterViewInit(): void {
    this.focusOnBar();
  }

  /**
   * Focuses on search bar input.
   */
  private focusOnBar(): void {
    const viewElement = this.viewRef.element.nativeElement;
    const nativeInput = viewElement.querySelector('app-tokens-search-bar tui-input input');

    // It's impossible to focus on element on iOS, but if we already have
    // focusable element, to focus on another is much more easy.
    // We creates fake input, focus on it, then focus on normal and remove fake one.
    const fakeInput = this.renderer.createElement('input');
    this.renderer.setAttribute(fakeInput, 'id', 'fake');
    this.renderer.setAttribute(fakeInput, 'type', 'text');
    this.renderer.setStyle(fakeInput, 'height', '0');
    this.renderer.setStyle(fakeInput, 'width', nativeInput.outerWidth);
    this.renderer.setStyle(fakeInput, 'opacity', '0');
    this.renderer.setStyle(fakeInput, 'font-size', '16px');
    this.renderer.insertBefore(this.renderer.parentNode(nativeInput), fakeInput, nativeInput);

    const fakeInputElement = viewElement.querySelector(
      'app-tokens-search-bar tui-input input#fake'
    );
    fakeInputElement.focus();

    setTimeout(() => {
      nativeInput.focus();
      nativeInput.scrollIntoView(false);
      fakeInputElement.remove();
    }, 100);
  }

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.searchQuery = model;
    this.searchQueryChange.emit(model);
  }
}
