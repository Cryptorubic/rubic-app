import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningModalComponent } from './warning-modal.component';

describe('HighGasPriceModalComponent', () => {
  let component: WarningModalComponent;
  let fixture: ComponentFixture<WarningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WarningModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
