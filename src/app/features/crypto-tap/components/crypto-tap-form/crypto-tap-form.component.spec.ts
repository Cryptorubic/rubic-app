import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoTapFormComponent } from './crypto-tap-form.component';

describe('CryptoTapFormComponent', () => {
  let component: CryptoTapFormComponent;
  let fixture: ComponentFixture<CryptoTapFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoTapFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoTapFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
