import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshToolComponent } from 'src/app/shared/components/refresh-button/refresh-tool.component';

describe('RefreshButtonComponent', () => {
  let component: RefreshToolComponent;
  let fixture: ComponentFixture<RefreshToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefreshToolComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefreshToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
