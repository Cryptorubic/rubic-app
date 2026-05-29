import { animate, style, transition, trigger } from '@angular/animations';

export const receiverAnimation = () =>
  trigger('receiverAnimation', [
    transition(':enter', [
      style({ height: '0px', opacity: 0.5 }),
      animate('0.2s ease-out', style({ height: '56px', opacity: 1 }))
    ]),
    transition(':leave', [
      style({ opacity: 1, height: '56px' }),
      animate('0.2s ease-in', style({ height: '0px', opacity: 0 }))
    ])
  ]);
