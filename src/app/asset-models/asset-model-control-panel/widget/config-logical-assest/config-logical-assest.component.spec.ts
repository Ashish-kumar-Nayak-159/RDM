import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigLogicalAssestComponent } from './config-logical-assest.component';

describe('ConfigLogicalAssestComponent', () => {
  let component: ConfigLogicalAssestComponent;
  let fixture: ComponentFixture<ConfigLogicalAssestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigLogicalAssestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigLogicalAssestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
