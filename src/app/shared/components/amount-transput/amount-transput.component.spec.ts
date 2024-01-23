import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountTransputComponent } from './amount-transput.component';

describe('AmountTransputComponent', () => {
  let component: AmountTransputComponent;
  let fixture: ComponentFixture<AmountTransputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AmountTransputComponent]
    });
    fixture = TestBed.createComponent(AmountTransputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
