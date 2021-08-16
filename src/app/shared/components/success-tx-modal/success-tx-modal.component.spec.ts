import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessTxModalComponent } from './success-tx-modal.component';

describe('SuccessTxModalComponent', () => {
  let component: SuccessTxModalComponent;
  let fixture: ComponentFixture<SuccessTxModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuccessTxModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessTxModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
