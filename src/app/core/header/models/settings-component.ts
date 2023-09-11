import { GasIndicatorComponent } from 'src/app/shared/components/gas-indicator/gas-indicator.component';
import { TutorialsComponent } from 'src/app/core/header/components/header/components/tutorials/tutorials.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ThemeSwitcherComponent } from 'src/app/core/header/components/header/components/theme-switcher/theme-switcher.component';
import { SettingsComponent } from '@core/header/components/header/components/settings/settings.component';

export type OptionsComponent = GasIndicatorComponent | ThemeSwitcherComponent | TutorialsComponent;

export interface SettingsComponentData {
  titleKey: string;
  component: PolymorpheusComponent<SettingsComponent, object>;
}
