describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    const copyright = cy.get('.rubic-footer__copyright');
    copyright.should('exist');
    copyright.should('contain.text', ' © Copyright Rubic 2024, ');
  });
});
