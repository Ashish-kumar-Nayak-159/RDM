import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetCountComponent } from './asset-count.component';

describe('AssetCountComponent', () => {
  let component: AssetCountComponent;
  let fixture: ComponentFixture<AssetCountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
