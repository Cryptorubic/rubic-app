import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemeService } from 'src/app/core/services/theme/theme.service';

@Pipe({
  name: 'themedIcon'
})
export class ThemedIconPipe implements PipeTransform {
  constructor(private readonly themeService: ThemeService) {}

  transform(path: string): Observable<string> {
    return this.themeService.theme$.pipe(
      map(theme => {
        if (theme === 'dark') {
          return `${path}.svg`;
        }
        return `${path}-light.svg`;
      })
    );
  }
}
