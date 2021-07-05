import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';

describe('UndefinedErrorComponent', () => {
  let component: UndefinedErrorComponent;
  let fixture: ComponentFixture<UndefinedErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UndefinedErrorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndefinedErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
