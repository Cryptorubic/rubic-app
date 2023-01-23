import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { CustomExpirationComponent } from '@features/swaps/features/limit-order/components/custom-expiration/custom-expiration.component';

@Component({
  selector: 'app-expires-in',
  templateUrl: './expires-in.component.html',
  styleUrls: ['./expires-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiresInComponent {
  public settingsComponent = new PolymorpheusComponent(CustomExpirationComponent);

  public settingsOpen = false;
}
