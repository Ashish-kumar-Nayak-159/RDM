import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelJsonPacketFormatComponent } from './asset-model-json-packet-format.component';

describe('AssetModelJsonPacketFormatComponent', () => {
  let component: AssetModelJsonPacketFormatComponent;
  let fixture: ComponentFixture<AssetModelJsonPacketFormatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelJsonPacketFormatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelJsonPacketFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
