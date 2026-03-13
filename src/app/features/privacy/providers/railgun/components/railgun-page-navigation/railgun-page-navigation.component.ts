import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Step, StepType } from '@features/privacy/providers/railgun/models/step';

@Component({
  selector: 'app-railgun-page-navigation',
  templateUrl: './railgun-page-navigation.component.html',
  styleUrls: ['./railgun-page-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunPageNavigationComponent {
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
    { type: 'transfer', label: 'Transfer tokens' },
    { type: 'swap', label: 'Private swaps' },
    { type: 'reveal', label: 'Reveal tokens' }
  ];

  public onStepClick(step: Step): void {
    this.handleStep.emit(step.type);
  }
}
