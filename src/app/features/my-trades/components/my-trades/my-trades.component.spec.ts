import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTradesComponent } from './my-trades.component';

describe('MyTradesComponent', () => {
  let component: MyTradesComponent;
  let fixture: ComponentFixture<MyTradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyTradesComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
