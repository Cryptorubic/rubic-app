import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-changenow-post-form',
  templateUrl: './changenow-post-form.component.html',
  styleUrls: ['./changenow-post-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangenowPostFormComponent {
  constructor(private readonly router: Router) {}

  public async navigateToSwaps(): Promise<void> {
    await this.router.navigate(['/'], { queryParamsHandling: 'merge' });
  }
}
