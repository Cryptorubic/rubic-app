import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapsHeaderComponent } from './swaps-header.component';

describe('SwapsHeaderComponent', () => {
  let component: SwapsHeaderComponent;
  let fixture: ComponentFixture<SwapsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwapsHeaderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
