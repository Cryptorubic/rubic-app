import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTokenFormComponent } from './custom-token-form.component';

describe('UseCustomTokenComponent', () => {
  let component: CustomTokenFormComponent;
  let fixture: ComponentFixture<CustomTokenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTokenFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTokenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
