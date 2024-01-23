import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersListGeneralComponent } from './providers-list-general.component';

describe('ProvidersListComponent', () => {
  let component: ProvidersListGeneralComponent;
  let fixture: ComponentFixture<ProvidersListGeneralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProvidersListGeneralComponent]
    });
    fixture = TestBed.createComponent(ProvidersListGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
