import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';

/**
 * Abstract class for mobile and desktop modals
 */
export abstract class AbstractModalService {
  abstract open<T, C, G>(
    component: PolymorpheusComponent<T & object, C & object>,
    options?: Partial<C>
  ): Observable<G>;
}
