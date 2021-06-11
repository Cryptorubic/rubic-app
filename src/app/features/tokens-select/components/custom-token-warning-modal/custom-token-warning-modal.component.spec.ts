import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTokenWarningModalComponent } from './custom-token-warning-modal.component';

describe('CustomTokenWarningModalComponent', () => {
  let component: CustomTokenWarningModalComponent;
  let fixture: ComponentFixture<CustomTokenWarningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTokenWarningModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTokenWarningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
