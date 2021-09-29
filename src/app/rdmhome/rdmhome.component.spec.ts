import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RDMHomeComponent } from './rdmhome.component';

describe('RDMHomeComponent', () => {
  let component: RDMHomeComponent;
  let fixture: ComponentFixture<RDMHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RDMHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RDMHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
