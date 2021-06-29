import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoTapTopFormComponent } from './crypto-tap-top-form.component';

describe('CryptoTapTopFormComponent', () => {
  let component: CryptoTapTopFormComponent;
  let fixture: ComponentFixture<CryptoTapTopFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoTapTopFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoTapTopFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
