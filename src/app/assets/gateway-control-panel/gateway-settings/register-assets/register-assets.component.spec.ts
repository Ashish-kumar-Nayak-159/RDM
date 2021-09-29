import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegisterAssetsComponent } from './register-assets.component';

describe('RegisterAssetsComponent', () => {
  let component: RegisterAssetsComponent;
  let fixture: ComponentFixture<RegisterAssetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
