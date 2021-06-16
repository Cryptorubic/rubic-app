import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicBannerComponent } from './rubic-banner.component';

describe('RubicBannerComponent', () => {
  let component: RubicBannerComponent;
  let fixture: ComponentFixture<RubicBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
