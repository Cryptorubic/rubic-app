import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicVolumeComponent } from './rubic-volume.component';

describe('RubicVolumeComponent', () => {
  let component: RubicVolumeComponent;
  let fixture: ComponentFixture<RubicVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicVolumeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
