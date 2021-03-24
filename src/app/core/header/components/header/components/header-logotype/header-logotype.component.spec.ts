import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLogotypeComponent } from './header-logotype.component';

describe('HeaderLogotypeComponent', () => {
  let component: HeaderLogotypeComponent;
  let fixture: ComponentFixture<HeaderLogotypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderLogotypeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderLogotypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
