import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeSectionComponent } from './bridge-section.component';

describe('BridgeSectionComponent', () => {
  let component: BridgeSectionComponent;
  let fixture: ComponentFixture<BridgeSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BridgeSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
