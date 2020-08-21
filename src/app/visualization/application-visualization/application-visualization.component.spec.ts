import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationVisualizationComponent } from './application-visualization.component';

describe('ApplicationVisualizationComponent', () => {
  let component: ApplicationVisualizationComponent;
  let fixture: ComponentFixture<ApplicationVisualizationComponent>;

  beforeEach(async(() => {
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
