import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapViewHomeComponent } from './map-view-home.component';

describe('MapViewHomeComponent', () => {
  let component: MapViewHomeComponent;
  let fixture: ComponentFixture<MapViewHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapViewHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
