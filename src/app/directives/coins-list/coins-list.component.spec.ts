import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CoinsListComponent } from './coins-list.component';

describe('CoinsListComponent', () => {
  let component: CoinsListComponent;
  let fixture: ComponentFixture<CoinsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CoinsListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
