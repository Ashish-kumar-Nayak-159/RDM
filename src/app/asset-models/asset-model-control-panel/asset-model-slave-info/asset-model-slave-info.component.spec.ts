import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelSlaveInfoComponent } from './asset-model-slave-info.component';

describe('AssetModelSlaveInfoComponent', () => {
  let component: AssetModelSlaveInfoComponent;
  let fixture: ComponentFixture<AssetModelSlaveInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelSlaveInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelSlaveInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
