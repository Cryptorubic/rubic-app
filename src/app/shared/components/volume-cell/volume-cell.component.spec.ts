import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeCellComponent } from './volume-cell.component';

describe('VolumeCellComponent', () => {
  let component: VolumeCellComponent;
  let fixture: ComponentFixture<VolumeCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeCellComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
