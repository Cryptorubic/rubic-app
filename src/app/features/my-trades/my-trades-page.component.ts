import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-trades-page',
  templateUrl: './my-trades-page.component.html',
  styleUrls: ['./my-trades-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTradesPageComponent {
  public walletConnected: Observable<boolean>;

  constructor(authService: AuthService) {
    this.walletConnected = authService.getCurrentUser().pipe(map(user => !!user?.address));
  }
}
