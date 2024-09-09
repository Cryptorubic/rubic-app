describe('OnChain в сети Ethereum', () => {
  it('Check main page and onChain swap', () => {
    cy.visit('https://app.rubic.exchange/');
    const copyright = cy.get('.rubic-footer__copyright');
    copyright.should('exist');
    copyright.should('contain.text', ' © Copyright Rubic ');

    // Проверка основных элементов на гоаыной странице
    cy.get('[class="_transitioned"]').should('exist'); // баннер
    cy.get('app-logo').should('exist'); // лого
    cy.get('[class=burger-menu]').should('exist'); // меню
    cy.get('[class="swap-button"]').should('exist').should('have.text', ' Swaps '); // кнопка swap
    cy.get('[class="staking-button"]').should('exist').should('have.text', ' Staking '); // кнопка staking
    cy.get('[class*=lang]').should('exist'); // смена языка
    cy.get('[class="history-button"]').should('exist'); // кнопка истории транзакций
    cy.get('[class*=profile]').should('exist'); // кнопка подключения кошелька

    const swapForm = cy.get('[class*=window]'); // форма свапа
    swapForm.should('contain.text', 'Swap');

    // Выбор исходящего токена в сети Ethereum (ETH)
    swapForm.get('app-asset-selector').eq(0).click();
    cy.get('[class="asset-types-aside"]').should('exist'); // список сетей
    cy.get('[class*=content-wrapper]').should('exist'); // список токенов
    cy.get('[class="back-button__text"]').should('have.text', 'Select Chain and Token');

    // Проверка текста во вкладках типа сетей
    const chainTypeList = cy.get('[class=blockchains-filter-list] button');
    const chainTypyNameList = ['All', 'Popular', 'Promo', 'Layer-2', 'EVM', 'Non-EVM'];

    chainTypeList.each(($button, index) => {
      const buttonText = $button.text().trim();
      const expectedText = chainTypyNameList[index];

      expect(buttonText).to.equal(expectedText);
    });

    // Проверка налиячия плашки Promo у списка сетей
    cy.get('[class="asset-types-aside"]').should('contain.text', 'PROMO');

    // Выбор токена ETH
    cy.get('[class="t-content"] li').eq(0).should('contain.text', 'ETHEthereum').click();

    // Проверка отображения выбранной сети и токена на форме
    cy.get('[class=selector]').eq(0).should('have.text', 'EthereumETH ');

    // Выбор целевого токена в сети Ethereum (USDT)
    swapForm.get('app-asset-selector').eq(1).click();
    cy.get('[class*=asset-types] ul').should('exist');
    cy.get('[class*=asset-types] button').eq(0).click();
    cy.get('[class="t-content"] li').eq(2).should('contain.text', 'Tether USD').click();

    //  Ввод амаунта =1
    cy.get('[inputmode="input"]').click().type('1');

    // Проверка калькуляции провайдеров
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
  });
});
