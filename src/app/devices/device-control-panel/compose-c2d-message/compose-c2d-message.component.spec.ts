import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposeC2DMessageComponent } from './compose-c2d-message.component';

describe('ComposeC2DMessageComponent', () => {
  let component: ComposeC2DMessageComponent;
  let fixture: ComponentFixture<ComposeC2DMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComposeC2DMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComposeC2DMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
