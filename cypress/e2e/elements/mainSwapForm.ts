class MainSwapForm {
  getMainFormSelectorList(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('app-asset-selector');
  }

  clickToSelector(type: 'from' | 'to'): void {
    this.getMainFormSelectorList()
      .eq(type === 'from' ? 0 : 1)
      .click();
  }
}

export default new MainSwapForm();
