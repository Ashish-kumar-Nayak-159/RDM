import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreGeneratedReportsComponent } from './pre-generated-reports.component';

describe('PreGeneratedReportsComponent', () => {
  let component: PreGeneratedReportsComponent;
  let fixture: ComponentFixture<PreGeneratedReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreGeneratedReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreGeneratedReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
