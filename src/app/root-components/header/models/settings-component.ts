import { LanguageSelectComponent } from '@app/root-components/header/components/language-select/language-select.component';
import { SettingsListComponent } from '@app/root-components/header/components/settings-list/settings-list.component';
import { CurrentLanguageComponent } from '@app/root-components/header/components/current-language/current-language.component';
import { GasIndicatorComponent } from '@shared/components/gas-indicator/gas-indicator.component';
import { TutorialsComponent } from '@app/root-components/header/components/tutorials/tutorials.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ThemeSwitcherComponent } from '@app/root-components/header/components/theme-switcher/theme-switcher.component';

export type SettingsComponent = LanguageSelectComponent | SettingsListComponent;

export type OptionsComponent =
  | CurrentLanguageComponent
  | GasIndicatorComponent
  | ThemeSwitcherComponent
  | TutorialsComponent;

export interface SettingsComponentData {
  titleKey: string;
  component: PolymorpheusComponent<SettingsComponent, object>;
}
