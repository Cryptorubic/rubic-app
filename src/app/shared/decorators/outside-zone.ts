import { inject, NgZone } from '@angular/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export function OutsideZone(_target: unknown, _key: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: unknown[]): RubicAny {
    try {
      const ngZone: NgZone = inject(NgZone);
      if (ngZone) {
        return ngZone.runOutsideAngular(() => originalMethod.apply(this, args));
      }
      return originalMethod.apply(this, args);
    } catch {
      return originalMethod.apply(this, args);
    }
  };
}
