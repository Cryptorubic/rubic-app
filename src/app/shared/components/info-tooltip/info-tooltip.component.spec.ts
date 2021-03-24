import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InfoTooltipComponent } from './info-tooltip.component';

describe('InfoTooltipComponent', () => {
  let component: InfoTooltipComponent;
  let fixture: ComponentFixture<InfoTooltipComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InfoTooltipComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
