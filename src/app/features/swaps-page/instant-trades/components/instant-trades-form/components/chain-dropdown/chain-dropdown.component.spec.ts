import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainDropdownComponent } from './chain-dropdown.component';

describe('ChainDropdownComponent', () => {
  let component: ChainDropdownComponent;
  let fixture: ComponentFixture<ChainDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChainDropdownComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
