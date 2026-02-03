import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Step, StepType } from '@features/privacy/models/step';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNavigationComponent {
  public stepIndex: number = 0;

  @Input({ required: true }) set currentStep(value: StepType) {
    this.stepIndex = this.steps.findIndex(step => step.type === value);
  }

  @Input({ required: true }) public railgunAddress: string;

  @Output()
  public handleStep = new EventEmitter<StepType>();

  public readonly steps: Step[] = [
    { type: 'connectWallet', label: 'Get private wallet' },
    { type: 'hide', label: 'Hide tokens' },
    { type: 'swap', label: 'Private swaps' },
    { type: 'reveal', label: 'Reveal tokens' }
  ];

  public onStepClick(step: Step): void {
    this.handleStep.emit(step.type);
  }
}
