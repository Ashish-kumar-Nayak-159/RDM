import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteListAssetComponent } from './white-list-asset.component';

describe('WhiteListAssetComponent', () => {
  let component: WhiteListAssetComponent;
  let fixture: ComponentFixture<WhiteListAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhiteListAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteListAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
