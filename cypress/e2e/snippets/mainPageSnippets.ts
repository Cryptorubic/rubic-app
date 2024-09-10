class MainPageSnippets {
  checkElementOnMainPage(): void {
    const copyright = cy.get('.rubic-footer__copyright');

    copyright.should('exist');
    copyright.should('contain.text', ' © Copyright Rubic '); // футтер
    cy.get('[class="_transitioned"]').should('exist'); // баннер
    cy.get('app-logo').should('exist'); // лого
    cy.get('[class=burger-menu]').should('exist'); // меню
    cy.get('[class="swap-button"]').should('exist').should('have.text', ' Swaps '); // кнопка swap
    cy.get('[class="staking-button"]').should('exist').should('have.text', ' Staking '); // кнопка staking
    cy.get('[class*=lang]').should('exist'); // смена языка
    cy.get('[class="history-button"]').should('exist'); // кнопка истории транзакций
    cy.get('[class*=profile]').should('exist'); // кнопка подключения кошелька
  }
}
export default MainPageSnippets;
