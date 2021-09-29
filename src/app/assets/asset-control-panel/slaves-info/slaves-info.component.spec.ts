import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SlavesInfoComponent } from './slaves-info.component';

describe('SlavesInfoComponent', () => {
  let component: SlavesInfoComponent;
  let fixture: ComponentFixture<SlavesInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SlavesInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlavesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
