import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InputTokenShort } from '../types';

import { TokenLabelComponent } from './token-label.component';

describe('TokenLabelComponent', () => {
  let component: TokenLabelComponent;
  let fixture: ComponentFixture<TokenLabelComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TokenLabelComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenLabelComponent);
    component = fixture.componentInstance;
    component.token = { image: 'test', name: 'test', symbol: 'test' } as InputTokenShort;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
