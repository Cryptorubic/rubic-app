import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractFormPayComponent } from './contract-form-pay.component';

describe('ContractFormPayComponent', () => {
  let component: ContractFormPayComponent;
  let fixture: ComponentFixture<ContractFormPayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractFormPayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractFormPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
