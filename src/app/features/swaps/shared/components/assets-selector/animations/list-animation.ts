import { animate, state, style, transition, trigger } from '@angular/animations';

export const LIST_ANIMATION = trigger('listAnimation', [
  transition(':enter', [style({ opacity: 0.4 }), animate('0.28s', style({ opacity: 1 }))]),
  state('hidden', style({ opacity: '0.4' })),
  state(
    'shown',
    style({
      opacity: '1'
    })
  ),
  transition('hidden => shown', animate('0.28s ease-in-out'))
]);
