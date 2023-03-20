import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallnumberwidgetComponent } from './smallnumberwidget.component';

describe('SmallnumberwidgetComponent', () => {
  let component: SmallnumberwidgetComponent;
  let fixture: ComponentFixture<SmallnumberwidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallnumberwidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallnumberwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
