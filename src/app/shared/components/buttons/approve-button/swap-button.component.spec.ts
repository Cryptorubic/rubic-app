import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapButtonComponent } from 'src/app/shared/components/buttons/approve-button/swap-button.component';

describe('ApproveButtonComponent', () => {
  let component: SwapButtonComponent;
  let fixture: ComponentFixture<SwapButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwapButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
