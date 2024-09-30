import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AlternativeRoute } from '../../services/alternative-route-api-service/models/alternative-route';
import { AlternativeRoutesService } from '../../services/alternative-route-api-service/alternative-routes.service';

@Component({
  selector: 'app-alternative-routes-list',
  templateUrl: './alternative-routes-list.component.html',
  styleUrls: ['./alternative-routes-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlternativeRoutesListComponent {
  @Input({ required: true }) alternativeRoutes: AlternativeRoute[];

  @Output() selectedRoute = new EventEmitter<AlternativeRoute>();

  public handleAlternativeRouteSelection(route: AlternativeRoute): void {
    this.selectedRoute.emit(route);
  }

  public readonly routeStatus$ = this.alternativeRouteService.alternativeRouteStatus$;

  constructor(private readonly alternativeRouteService: AlternativeRoutesService) {}
}
