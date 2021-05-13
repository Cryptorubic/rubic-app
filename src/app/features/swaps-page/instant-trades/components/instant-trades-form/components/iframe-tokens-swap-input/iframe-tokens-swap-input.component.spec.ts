import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeTokensSwapInputComponent } from './iframe-tokens-swap-input.component';

describe('IframeTokensSwapInputComponent', () => {
  let component: IframeTokensSwapInputComponent;
  let fixture: ComponentFixture<IframeTokensSwapInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeTokensSwapInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeTokensSwapInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
