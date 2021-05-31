import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedOptionsButtonComponent } from './advanced-options-button.component';

describe('AdvancedOptionsButtonComponent', () => {
  let component: AdvancedOptionsButtonComponent;
  let fixture: ComponentFixture<AdvancedOptionsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvancedOptionsButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedOptionsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
