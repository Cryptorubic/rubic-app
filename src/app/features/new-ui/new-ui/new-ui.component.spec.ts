import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUiComponent } from './new-ui.component';

describe('NewUiComponent', () => {
  let component: NewUiComponent;
  let fixture: ComponentFixture<NewUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewUiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
