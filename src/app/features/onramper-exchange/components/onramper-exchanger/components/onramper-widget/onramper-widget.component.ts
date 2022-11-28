import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { WidgetConfig } from '@features/onramper-exchange/components/onramper-exchanger/components/onramper-widget/models/widget-config';
import { ThemeService } from '@core/services/theme/theme.service';
import { defaultWidgetConfig } from '@features/onramper-exchange/components/onramper-exchanger/components/onramper-widget/constants/default-widget-config';

@Component({
  selector: 'app-onramper-widget',
  templateUrl: './onramper-widget.component.html',
  styleUrls: ['./onramper-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperWidgetComponent implements OnInit {
  @ViewChild('onramperWidget') public onramperWidget: ElementRef;

  private widgetConfig: WidgetConfig;

  public get widgetUrl(): string {
    const queryParams = Object.entries(this.widgetConfig).reduce(
      (acc, [key, value]) => `${acc}${acc ? '&' : ''}${key}=${value}`,
      ''
    );
    return `https://widget.onramper.com${queryParams ? '/?' : ''}${queryParams}`;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit() {
    this.setWidgetConfig();

    this.themeService.theme$.subscribe(() => {
      this.setWidgetConfig();
    });
  }

  private setWidgetConfig(): void {
    const darkMode = this.themeService.theme === 'dark';
    this.widgetConfig = {
      ...defaultWidgetConfig,
      darkMode
    };

    this.cdr.detectChanges();
  }
}
