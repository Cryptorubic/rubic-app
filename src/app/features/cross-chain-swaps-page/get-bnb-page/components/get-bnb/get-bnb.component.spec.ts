import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetBnbComponent } from './get-bnb.component';

describe('GetBnbComponent', () => {
  let component: GetBnbComponent;
  let fixture: ComponentFixture<GetBnbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetBnbComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetBnbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
