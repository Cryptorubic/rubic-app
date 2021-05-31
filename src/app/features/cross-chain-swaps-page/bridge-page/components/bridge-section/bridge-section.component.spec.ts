import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BridgeSectionComponent } from './bridge-section.component';
import { SharedModule } from '../../../../../shared/shared.module';

describe('BridgeSectionComponent', () => {
  let component: BridgeSectionComponent;
  let fixture: ComponentFixture<BridgeSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, TranslateModule.forRoot()],
      declarations: [BridgeSectionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
