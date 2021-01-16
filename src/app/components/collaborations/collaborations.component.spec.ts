import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationsComponent } from './collaborations.component';

describe('CollaborationsComponent', () => {
  let component: CollaborationsComponent;
  let fixture: ComponentFixture<CollaborationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
