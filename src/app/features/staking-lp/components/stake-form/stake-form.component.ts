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

  public durations: { value: number; name: string; selected: boolean }[] = [
    { value: 1, name: '1 M', selected: false },
    { value: 3, name: '3 M', selected: true },
    { value: 6, name: '6 M', selected: false }
  ];

  public duration: { id: number; month: number } = { id: 1, month: this.durations[1].value };

  public durationRadioButtonForm = new FormGroup({
    durationForm: new FormControl(this.durations[1].name)
  });

  readonly sliderConfig = {
    min: 1,
    max: 12,
    sliderStep: 1,
    quantum: 0.01,
    control: new FormControl(this.duration.month)
  };

  readonly steps = (this.sliderConfig.max - this.sliderConfig.min) / this.sliderConfig.sliderStep;

  public setDuration(newDuration: number, id: number): void {
    this.sliderConfig.control.setValue(newDuration);
    this.durations[this.duration.id].selected = false;
    this.durations[id].selected = true;
    this.duration.id = id;
    this.duration.month = newDuration;
  }

  public setMaxDuration(): void {
    this.sliderConfig.control.setValue(12);
    this.durations[this.duration.id].selected = false;
    this.duration.month = 12;
  }
}
