import SwapSnippets from '../snippets/swapSnippets';
import MainPageSnippets from '../snippets/mainPageSnippets';

describe('onChain swap', () => {
  const swapSnippets = new SwapSnippets();
  const mainPageSnippets = new MainPageSnippets();

  it('Проверка onChain свапа до калькуляции без подключенного кошелька', () => {
    cy.visit('https://app.rubic.exchange/');

    // Проверка элементов на главной странице
    mainPageSnippets.checkElementOnMainPage();

    // Выбор исходящего токена в сети Ethereum (ETH)
    swapSnippets.chooseChainAndToken('from', 'Ethereum', 'ETH');

    // Выбор исходящего токена в сети Ethereum (USDT)
    swapSnippets.chooseChainAndToken('to', 'Ethereum', 'USDT');

    // Ввод значения суммы свапа
    swapSnippets.setAmount('1');

    // Ппроверка элементов калькуляции провайдеров
    swapSnippets.checkProvidersCalculation();
  });
});
