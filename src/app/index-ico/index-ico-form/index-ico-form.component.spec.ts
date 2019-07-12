import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexIcoFormComponent } from './index-ico-form.component';

describe('IndexIcoFormComponent', () => {
  let component: IndexIcoFormComponent;
  let fixture: ComponentFixture<IndexIcoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexIcoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexIcoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
