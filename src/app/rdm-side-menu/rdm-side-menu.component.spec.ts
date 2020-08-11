import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RDMSideMenuComponent } from './rdm-side-menu.component';

describe('RDMSideMenuComponent', () => {
  let component: RDMSideMenuComponent;
  let fixture: ComponentFixture<RDMSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RDMSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RDMSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
