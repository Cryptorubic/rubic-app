import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractFormAllComponent } from './contract-form-all.component';

describe('ContractFormAllComponent', () => {
  let component: ContractFormAllComponent;
  let fixture: ComponentFixture<ContractFormAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractFormAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractFormAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
