import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapsButtonComponent } from './swaps-button.component';

describe('SwapsButtonComponent', () => {
  let component: SwapsButtonComponent;
  let fixture: ComponentFixture<SwapsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwapsButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
