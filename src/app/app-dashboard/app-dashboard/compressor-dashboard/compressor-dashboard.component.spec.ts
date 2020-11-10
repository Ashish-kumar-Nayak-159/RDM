import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressorDashboardComponent } from './compressor-dashboard.component';

describe('CompressorDashboardComponent', () => {
  let component: CompressorDashboardComponent;
  let fixture: ComponentFixture<CompressorDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressorDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
