import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCountComponent } from './asset-count.component';

describe('AssetCountComponent', () => {
  let component: AssetCountComponent;
  let fixture: ComponentFixture<AssetCountComponent>;

  beforeEach(async(() => {
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
