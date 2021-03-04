import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollaborationsComponent } from './collaborations.component';

describe('CollaborationsComponent', () => {
  let component: CollaborationsComponent;
  let fixture: ComponentFixture<CollaborationsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CollaborationsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
