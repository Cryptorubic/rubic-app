import { inject, InjectionToken } from '@angular/core';
import { WINDOW } from 'src/app/core/models/window';

/**
 * @description An abstraction over global window object.
 */
export const NAVIGATOR = new InjectionToken<Navigator>(
  'An abstraction over window.navigator object',
  {
    factory: () => inject(WINDOW).navigator
  }
);
