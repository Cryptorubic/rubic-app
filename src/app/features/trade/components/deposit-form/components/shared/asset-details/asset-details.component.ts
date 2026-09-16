import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AssetSelector } from '@app/shared/models/asset-selector';

@Component({
  selector: 'app-asset-details',
  standalone: false,
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetDetailsComponent {
  @Input({ required: true }) asset: Required<AssetSelector>;

  @Input() tokenAmount: string;
}
