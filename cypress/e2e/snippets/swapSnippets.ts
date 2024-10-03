import MainSwapForm from '../elements/mainSwapForm';

class SwapSnippetPage {
  // Выбор исходящих и целевых сетей и токенов
  chooseChainAndToken(type: 'from' | 'to', chainName: string, tokenName: string): void {
    MainSwapForm.clickToSelector(type);

    if (type === 'from' && chainName !== 'Ethereum') {
      cy.contains('[class="asset-types-aside"] ul > button', chainName).click();
    } else if (type === 'to') {
      cy.contains('[class="asset-types-aside"] ul > button', chainName).click();
    }
    cy.contains('app-tokens-list li', tokenName).click();
  }

  // Ввод значения суммы свапа
  setAmount(amount: string): void {
    cy.get('#token-amount-input-element').click().type(amount);
  }

  // Ппроверка элементов калькуляции провайдеров
  checkProvidersCalculation(): void {
    cy.get('[appearance="primary"]').should('exist').should('have.text', ' Connect wallet '); // кнопка подклчения кошелька на форме свапа
    cy.get('app-providers-list-general h5').should('have.text', 'Providers list');
    const providerList = cy.get('app-provider-element');
    const firstProviderCard = providerList.eq(0);

    providerList.should('exist');
    firstProviderCard.get('[class="t-tag"]').should('have.text', 'Best');
    firstProviderCard.get('[class="element__token-image"]').should('exist'); // логотип провайдера
    firstProviderCard.get('[class="element__token-symbol"]').should('exist'); // наименование провайдера
    firstProviderCard.get('[class*="element__amount-price"]').should('contain', '$');
    firstProviderCard.get('[class*=inserted]').should('contain', ' ~ $');
    firstProviderCard.get('[class*=time]').should('contain', 'M');
  }
}
export default SwapSnippetPage;
