import { PrivateStep } from '../models/preview-swap-options';

export function donePrivateStep(): PrivateStep {
  return {
    label: 'Done',
    action: context => {
      context.completeWith();
      return Promise.resolve({});
    },
    disabled: false,
    showLoaderOnAction: false
  };
}
