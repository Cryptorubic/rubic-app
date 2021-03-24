import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenFormComponent } from './token-form.component';

describe('TokenFormComponent', () => {
  let component: TokenFormComponent;
  let fixture: ComponentFixture<TokenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
