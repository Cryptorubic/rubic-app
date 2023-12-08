export const animationState = {
  focus: 'focus',
  leave: 'leave'
} as const;

export type AnimationState = (typeof animationState)[keyof typeof animationState];
