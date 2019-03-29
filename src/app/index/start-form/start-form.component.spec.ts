import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartFormComponent } from './start-form.component';

describe('StartFormComponent', () => {
  let component: StartFormComponent;
  let fixture: ComponentFixture<StartFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
