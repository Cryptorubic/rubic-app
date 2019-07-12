import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexIcoHeaderComponent } from './index-ico-header.component';

describe('IndexIcoHeaderComponent', () => {
  let component: IndexIcoHeaderComponent;
  let fixture: ComponentFixture<IndexIcoHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexIcoHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexIcoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
