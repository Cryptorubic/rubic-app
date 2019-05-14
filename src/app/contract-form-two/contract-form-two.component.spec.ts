import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractFormTwoComponent } from './contract-form-two.component';

describe('ContractFormTwoComponent', () => {
  let component: ContractFormTwoComponent;
  let fixture: ComponentFixture<ContractFormTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractFormTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractFormTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
