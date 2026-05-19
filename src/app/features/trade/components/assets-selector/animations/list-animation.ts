import {
  animate,
  animateChild,
  query,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

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

export const LIST_ANIMATION_2 = trigger('listAnimation2', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(
      '220ms cubic-bezier(0.16, 1, 0.3, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ]),
  transition(':leave', [
    animate(
      '180ms cubic-bezier(0.16, 1, 0.3, 1)',
      style({ opacity: 0, transform: 'translateY(-10px)' })
    )
  ])
]);

export const LIST_CHANGE_ANIMATION = trigger('listChangeAnimation', [
  transition('* => *', [
    style({ opacity: 0, transform: 'scale(1.1)' }),
    animate('5s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);

export const containerAnim = trigger('containerAnim', [
  transition('* => *', [query('@innerAnim', animateChild(), { optional: true })])
]);

export const innerAnim = trigger('innerAnim', [
  transition('* => *', [
    style({ opacity: 0, transform: 'scale(1.1)' }),
    animate('5s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);
