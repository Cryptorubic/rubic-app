import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../../../../core/services/auth/auth.service';
import { UserInterface } from '../../../../../../../core/services/auth/models/user.interface';
import { QueryParamsService } from '../../../../../../../core/services/query-params/query-params.service';

@Component({
  selector: 'app-iframe-profile',
  templateUrl: './iframe-profile.component.html',
  styleUrls: ['./iframe-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeProfileComponent {
  public readonly $userAddress: Observable<UserInterface>;

  public $theme: Observable<string>;

  constructor(
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService
  ) {
    this.$userAddress = this.authService.getCurrentUser();
    this.$theme = this.queryParamsService.$theme;
  }

  public logout(): void {
    this.authService.iframeSignOut();
  }
}
