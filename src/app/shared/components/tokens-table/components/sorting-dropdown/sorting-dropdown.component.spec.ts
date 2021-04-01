import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingDropdownComponent } from './sorting-dropdown.component';

describe('SortingDropdownComponent', () => {
  let component: SortingDropdownComponent;
  let fixture: ComponentFixture<SortingDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortingDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SortingDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
