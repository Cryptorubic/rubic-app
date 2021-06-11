import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTokenComponent } from './custom-token.component';

describe('CustomTokenComponent', () => {
  let component: CustomTokenComponent;
  let fixture: ComponentFixture<CustomTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
