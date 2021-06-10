import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';
import { TuiSvgService } from '@taiga-ui/core';
import { tuiIconSearch } from '@taiga-ui/icons';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent {
  @Input() query: string;

  @Output() queryChange = new EventEmitter<string>();

  public tuiIconSearch = tuiIconSearch;

  constructor(@Inject(TuiSvgService) tuiSvgService: TuiSvgService) {
    tuiSvgService.define({ tuiIconSearch });
  }

  onQueryChanges(model: string) {
    this.query = model;
    this.queryChange.emit(model);
  }
}
