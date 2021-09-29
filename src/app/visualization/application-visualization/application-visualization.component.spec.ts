import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationVisualizationComponent } from './application-visualization.component';

describe('ApplicationVisualizationComponent', () => {
  let component: ApplicationVisualizationComponent;
  let fixture: ComponentFixture<ApplicationVisualizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
