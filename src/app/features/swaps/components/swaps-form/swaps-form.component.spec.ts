import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapsFormComponent } from './swaps-form.component';

describe('SwapsFormComponent', () => {
  let component: SwapsFormComponent;
  let fixture: ComponentFixture<SwapsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwapsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
