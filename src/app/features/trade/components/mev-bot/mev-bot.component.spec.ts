import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MevBotComponent } from './mev-bot.component';

describe('MevBotComponent', () => {
  let component: MevBotComponent;
  let fixture: ComponentFixture<MevBotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MevBotComponent]
    });
    fixture = TestBed.createComponent(MevBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
