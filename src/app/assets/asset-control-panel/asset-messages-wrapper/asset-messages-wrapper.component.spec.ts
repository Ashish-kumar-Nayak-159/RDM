import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMessagesWrapperComponent } from './asset-messages-wrapper.component';

describe('AssetMessagesWrapperComponent', () => {
  let component: AssetMessagesWrapperComponent;
  let fixture: ComponentFixture<AssetMessagesWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetMessagesWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetMessagesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
