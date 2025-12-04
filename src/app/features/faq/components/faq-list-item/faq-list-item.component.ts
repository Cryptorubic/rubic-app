import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FaqItem } from '../../constants/faqs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-faq-list-item',
  templateUrl: './faq-list-item.component.html',
  styleUrls: ['./faq-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showBodyAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0.5 }),
        animate('0.2s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('0.2s ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class FaqListItemComponent {
  @Input() info: FaqItem;

  public opened: boolean = false;

  public onClick(): void {
    this.opened = !this.opened;
  }
}
