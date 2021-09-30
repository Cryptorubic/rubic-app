import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  Inject,
  ViewContainerRef,
  Renderer2
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TUI_IS_IOS } from '@taiga-ui/cdk';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent implements AfterViewInit {
  @Input() query: string;

  @Output() queryChange = new EventEmitter<string>();

  private openCount: number;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly viewRef: ViewContainerRef,
    private readonly renderer: Renderer2,
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.openCount = 0;
  }

  public ngAfterViewInit(): void {
    this.focusOnBar();
  }

  /**
   * Focuses search bar input.
   */
  private focusOnBar(): void {
    const viewElement = this.viewRef.element.nativeElement;
    const nativeInput = viewElement.querySelector('app-tokens-search-bar tui-input input');

    // It's impossible to focus element on iOS, but if we already have
    // focusable element, to focus another is much more easy.
    // We creates fake input, focus it, then focus normal and remove fake.
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
   * Handle input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.query = model;
    this.queryChange.emit(model);
  }
}
