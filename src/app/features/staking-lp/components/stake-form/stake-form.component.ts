import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

interface Durations {
  value: number;
  name: string;
  selected: boolean;
}

interface Duration {
  id: number;
  month: number;
}

@Component({
  selector: 'app-stake-form',
  templateUrl: './stake-form.component.html',
  styleUrls: ['./stake-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeFormComponent {
  constructor() {}

  public durations: Durations[] = [
    { value: 1, name: '1 M', selected: false },
    { value: 3, name: '3 M', selected: true },
    { value: 6, name: '6 M', selected: false }
  ];

  public duration: Duration = { id: 1, month: this.durations[1].value };

  public durationRadioButtonForm = new FormGroup({
    duration: new FormControl(this.durations[1].name)
  });

  public readonly sliderConfig = {
    min: 1,
    max: 12,
    sliderStep: 1,
    quantum: 0.01
  };

  public readonly control = new FormControl(this.duration.month);

  public readonly steps =
    (this.sliderConfig.max - this.sliderConfig.min) / this.sliderConfig.sliderStep;

  public setDuration(newDuration: number, id: number): void {
    this.control.setValue(newDuration);
    this.durations[this.duration.id].selected = false;
    this.durations[id].selected = true;
    this.duration.id = id;
    this.duration.month = newDuration;
  }

  public setMaxDuration(): void {
    this.control.setValue(12);
    this.durations[this.duration.id].selected = false;
    this.duration.month = 12;
  }
}
