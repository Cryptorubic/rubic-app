import { RubicLanguageSelectComponent } from 'src/app/core/header/components/header/components/rubic-language-select/rubic-language-select.component';
import { SettingsListComponent } from 'src/app/core/header/components/header/components/settings-list/settings-list.component';
import { CurrentLanguageComponent } from 'src/app/core/header/components/header/components/current-language/current-language.component';
import { GasIndicatorComponent } from 'src/app/shared/components/gas-indicator/gas-indicator.component';
import { TutorialsComponent } from 'src/app/core/header/components/header/components/tutorials/tutorials.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ThemeSwitcherComponent } from 'src/app/core/header/components/header/components/theme-switcher/theme-switcher.component';

export type SettingsComponent = RubicLanguageSelectComponent | SettingsListComponent;

export type OptionsComponent =
  | CurrentLanguageComponent
  | GasIndicatorComponent
  | ThemeSwitcherComponent
  | TutorialsComponent;

export interface SettingsComponentData {
  titleKey: string;
  component: PolymorpheusComponent<SettingsComponent, object>;
}
