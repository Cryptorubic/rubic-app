import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stake-form',
  templateUrl: './stake-form.component.html',
  styleUrls: ['./stake-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeFormComponent {
  constructor() {}

  items = [{ name: '1' }, { name: '3' }, { name: '6' }];

  testForm = new FormGroup({
    testValue1: new FormControl(this.items[1])
  });

  readonly min = 1;

  readonly max = 12;

  readonly sliderStep = 1;

  readonly steps = (this.max - this.min) / this.sliderStep;

  public duration: number = +this.items[1].name;

  readonly quantum = 0.01;

  readonly control = new FormControl(+this.duration);

  public setDuration(newDuration: string): void {
    this.control.setValue(+newDuration);
    this.duration = +newDuration;
  }
}
