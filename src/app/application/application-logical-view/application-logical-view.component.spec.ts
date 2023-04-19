import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationLogicalViewComponent } from './application-logical-view.component';

describe('ApplicationLogicalViewComponent', () => {
  let component: ApplicationLogicalViewComponent;
  let fixture: ComponentFixture<ApplicationLogicalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationLogicalViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationLogicalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
