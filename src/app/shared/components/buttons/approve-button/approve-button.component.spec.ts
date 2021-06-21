import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveButtonComponent } from './approve-button.component';

describe('ApproveButtonComponent', () => {
  let component: ApproveButtonComponent;
  let fixture: ComponentFixture<ApproveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
