import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeProfileComponent } from './iframe-profile.component';

describe('IframeProfileComponent', () => {
  let component: IframeProfileComponent;
  let fixture: ComponentFixture<IframeProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IframeProfileComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
