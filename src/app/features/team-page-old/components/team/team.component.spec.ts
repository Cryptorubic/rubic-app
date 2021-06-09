import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentLoaderService } from 'src/app/core/services/content-loader/content-loader.service';

import { TeamComponent } from './team.component';

class MockService {
  teamCardsContent = [];
}

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [
          {
            provide: ContentLoaderService,
            useValue: MockService
          }
        ],
        declarations: [TeamComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
