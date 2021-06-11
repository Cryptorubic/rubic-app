import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { TokenAmountDirective } from './token-amount.directive';

class MockElementRef implements ElementRef {
  nativeElement = {};
}

describe('TokenAmountDirective', () => {
  let elementRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useClass: MockElementRef }]
    }).compileComponents();

    elementRef = TestBed.inject(ElementRef);
  });

  it('should create an instance', () => {
    const directive = new TokenAmountDirective(elementRef);

    expect(directive).toBeTruthy();
  });
});
