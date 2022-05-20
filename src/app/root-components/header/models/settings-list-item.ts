import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { OptionsComponent } from '@app/root-components/header/models/settings-component';

export interface SettingsListItem {
  title: string;
  description: string;
  component: PolymorpheusComponent<OptionsComponent, object>;
  action?: () => {};
  arrow?: boolean;
}
