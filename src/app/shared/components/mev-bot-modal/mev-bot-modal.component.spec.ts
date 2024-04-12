import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MevBotModalComponent } from './mev-bot-modal.component';

describe('MevBotModalComponent', () => {
  let component: MevBotModalComponent;
  let fixture: ComponentFixture<MevBotModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MevBotModalComponent]
    });
    fixture = TestBed.createComponent(MevBotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
