import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeBlockComponent } from './volume-block.component';

describe('VolumeBlockComponent', () => {
  let component: VolumeBlockComponent;
  let fixture: ComponentFixture<VolumeBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolumeBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
