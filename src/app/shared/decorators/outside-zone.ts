import { NgZone } from '@angular/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export function OutsideZone(_target: unknown, _key: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: unknown[]): RubicAny {
    const ngZone: NgZone = this.ngZone; // Предполагается, что NgZone заинжекчен в класс
    if (ngZone) {
      return ngZone.runOutsideAngular(() => originalMethod.apply(this, args));
    }
    return originalMethod.apply(this, args);
  };
}
