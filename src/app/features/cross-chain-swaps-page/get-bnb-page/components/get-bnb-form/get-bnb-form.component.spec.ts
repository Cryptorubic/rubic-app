import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetBnbFormComponent } from './get-bnb-form.component';

describe('GetBnbFormComponent', () => {
  let component: GetBnbFormComponent;
  let fixture: ComponentFixture<GetBnbFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetBnbFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetBnbFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
