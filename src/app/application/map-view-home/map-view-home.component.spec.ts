import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewHomeComponent } from './map-view-home.component';

describe('MapViewHomeComponent', () => {
  let component: MapViewHomeComponent;
  let fixture: ComponentFixture<MapViewHomeComponent>;

  beforeEach(async(() => {
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
