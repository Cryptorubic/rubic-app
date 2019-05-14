import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractPreviewTwoComponent } from './contract-preview-two.component';

describe('ContractPreviewTwoComponent', () => {
  let component: ContractPreviewTwoComponent;
  let fixture: ComponentFixture<ContractPreviewTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractPreviewTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractPreviewTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
