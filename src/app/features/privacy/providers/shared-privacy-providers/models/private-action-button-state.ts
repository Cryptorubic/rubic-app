export interface PrivateActionButtonState {
  /**
   * Property `parent` stands for action, passed by parent component.
   * Property `action` stands for action, handled by action button service.
   */
  type: 'error' | 'action' | 'parent';
  text: string;
  action?: () => void;
}
