import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContractsListComponent } from './contracts-list.component';

describe('ContractsListComponent', () => {
  let component: ContractsListComponent;
  let fixture: ComponentFixture<ContractsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContractsListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
