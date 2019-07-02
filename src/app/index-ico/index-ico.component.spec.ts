import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexIcoComponent } from './index-ico.component';

describe('IndexIcoComponent', () => {
  let component: IndexIcoComponent;
  let fixture: ComponentFixture<IndexIcoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexIcoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexIcoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
