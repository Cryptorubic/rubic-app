import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteButtonComponent } from './white-button.component';

describe('WhiteButtonComponent', () => {
  let component: WhiteButtonComponent;
  let fixture: ComponentFixture<WhiteButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
