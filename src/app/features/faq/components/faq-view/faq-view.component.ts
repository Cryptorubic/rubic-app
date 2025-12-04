import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATH } from '@app/shared/constants/common/links';
import { FAQS } from '../../constants/faqs';

@Component({
  selector: 'app-faq-view',
  templateUrl: './faq-view.component.html',
  styleUrls: ['./faq-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqViewComponent {
  public readonly FAQS = FAQS;

  constructor(private readonly router: Router) {}

  public backToSwap(): void {
    this.router.navigate(['/' + ROUTE_PATH.NONE]);
  }
}
