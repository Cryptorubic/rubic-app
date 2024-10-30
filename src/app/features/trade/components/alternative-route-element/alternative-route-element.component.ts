import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AlternativeRoute } from '../../services/alternative-route-api-service/models/alternative-route';

@Component({
  selector: 'app-alternative-route-element',
  templateUrl: './alternative-route-element.component.html',
  styleUrls: ['./alternative-route-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlternativeRouteElementComponent {
  @Input({ required: true }) route: AlternativeRoute;

  @Output() selectedRoute = new EventEmitter<AlternativeRoute>();

  public handleSelectedRoute(): void {
    this.selectedRoute.emit(this.route);
  }
}
