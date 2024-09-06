describe('OnChain в сети Ethereum test', () => {
  it('Visits the initial project page', () => {
    cy.visit('https://app.rubic.exchange/');
    const copyright = cy.get('.rubic-footer__copyright');
    copyright.should('exist');
    copyright.should('contain.text', ' © Copyright Rubic 2024, ');

    // Проверка основных элементов на гоаыной странице
    cy.get('[class="_transitioned"]').should('exist'); // баннер
    cy.get('[alt="Rubic logotype"]').should('exist'); // лого
    cy.get('[class=burger-menu]').should('exist'); // меню
    cy.get('[class="swap-button"]').should('exist').should('have.text', ' Swaps '); // кнопка swap
    cy.get('[class="staking-button"]').should('exist').should('have.text', ' Staking '); // кнопка staking
    cy.get('[class*=lang]').should('exist'); // смена языка
    cy.get('[class="history-button"]').should('exist'); // кнопка истории транзакций
    cy.get('[data-appearance="primary"] > [class="t-wrapper"]')
      .eq(0)
      .should('exist')
      .should('have.text', ' Подключить кошелек\n'); // кнопка подключения кошелька
    const swapCalc = cy.get('[class*=window]');
    swapCalc.should('contain.text', 'Swap'); // калькулятор свапа

    // Выбор исходящего токена в сети Ethereum (ETH)
    swapCalc.get('[alt="Select token"]').eq(0).click();
    cy.get('[class="asset-types-aside"]').should('exist'); // список сетей
    cy.get('[class*=content-wrapper]').should('exist'); // список токенов
    cy.get('[class="back-button__text"]').should('have.text', 'Select Chain and Token');

    /* 1. Вынести в отдельную функцию выбор сети токена (название сети, название токена, адрес токена, from/to)
       2. Вынести в отдельный сценарий (
      */

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
    cy.get('[class*=asset-types] button').eq(0).should('have.text', 'EthereumPROMO');
    cy.get('[class="t-content"] li').eq(0).should('contain.text', 'ETHEthereum').click();

    // Проверка отображения выбранной сети и токена на калькуляторе
    cy.get('[class=selector]').eq(0).should('have.text', 'EthereumETH ');

    // Выбор целевого токена в сети Ethereum (USDT)
    swapCalc.get('[alt="Select token"]').eq(1).click();
    cy.get('[class*=asset-types] ul').should('exist');
    cy.get('[class*=asset-types] button').eq(0).should('have.text', 'EthereumPROMO').click();
    cy.get('[class="t-content"] li').eq(2).should('contain.text', 'Tether USD').click();

    //  Ввод амаунта
    swapCalc.get('[placeholder="Enter an Amount"]').click().type('1');

    // Проверка калькуляции провайдеров
    cy.get('[data-appearance="primary"] > [class="t-wrapper"]')
      .eq(1)
      .should('exist')
      .should('have.text', ' Connect wallet ');
    cy.get('app-providers-list-general h5').should('have.text', 'Providers list');
    const providerList = cy.get('app-provider-element');
    const firstProviderCard = providerList.eq(0);

    providerList.should('exist');
    firstProviderCard.get('[class="t-tag"]').should('have.text', 'Best');
    firstProviderCard.get('[class="element__token-image"]').should('exist'); // логотип провайдера
    firstProviderCard.get('[class="element__token-symbol"]').should('exist'); // наименование провайдера
    firstProviderCard.get('[class*="element__amount-price"]').should('contain', '$');
    firstProviderCard.get('[alt="Fee"]').should('contain', ' ~ $');
    firstProviderCard.get('[alt*="Time"]').should('contain', 'M');
  });
});
