import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlynumberwidgetComponent } from './onlynumberwidget.component';

describe('OnlynumberwidgetComponent', () => {
  let component: OnlynumberwidgetComponent;
  let fixture: ComponentFixture<OnlynumberwidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlynumberwidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlynumberwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
