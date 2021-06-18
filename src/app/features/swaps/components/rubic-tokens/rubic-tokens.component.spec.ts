import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicTokensComponent } from './rubic-tokens.component';

describe('RubicTokensComponent', () => {
  let component: RubicTokensComponent;
  let fixture: ComponentFixture<RubicTokensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RubicTokensComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
