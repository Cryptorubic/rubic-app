import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContractsPreviewV3Component } from './contracts-preview-v3.component';

describe('ContractsPreviewV3Component', () => {
  let component: ContractsPreviewV3Component;
  let fixture: ComponentFixture<ContractsPreviewV3Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContractsPreviewV3Component]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsPreviewV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
