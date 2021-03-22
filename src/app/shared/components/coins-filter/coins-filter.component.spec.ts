import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoinsFilterComponent } from './coins-filter.component';

describe('CoinsDropdownComponent', () => {
  let component: CoinsFilterComponent;
  let fixture: ComponentFixture<CoinsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoinsFilterComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
