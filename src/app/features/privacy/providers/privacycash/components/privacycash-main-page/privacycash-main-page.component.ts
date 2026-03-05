import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PRIVACYCASH_STEPS } from '../../constants/privacycash-steps';
import { Step, StepType } from '../../models/step';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';

@Component({
  selector: 'app-privacy-cash-view',
  templateUrl: './privacycash-main-page.component.html',
  styleUrls: ['./privacycash-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacycashMainPageComponent {
  public readonly steps = PRIVACYCASH_STEPS;

  private readonly _currentStep$ = new BehaviorSubject<Step>(this.steps[0]);

  public readonly currentStep$ = this._currentStep$.asObservable();

  public onStepChange(value: PageType): void {
    const stepType = value.type as StepType;
    const currentStep = this.steps.find(s => s.type === stepType) || this.steps[0];
    this._currentStep$.next(currentStep);
  }
}
