import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapsButtonOldComponent } from 'src/app/features/swaps/components/swaps-button/swaps-button-old.component';

describe('SwapsButtonComponent', () => {
  let component: SwapsButtonOldComponent;
  let fixture: ComponentFixture<SwapsButtonOldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwapsButtonOldComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapsButtonOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
