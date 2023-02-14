import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';

export abstract class AbstractModalService {
  abstract open<T, C, G>(
    component: PolymorpheusComponent<T & object, C & object>,
    options?: Partial<C>
  ): Observable<G>;
}
