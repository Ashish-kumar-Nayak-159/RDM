import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteListAssetListComponent } from './white-list-asset-list.component';

describe('WhiteListAssetListComponent', () => {
  let component: WhiteListAssetListComponent;
  let fixture: ComponentFixture<WhiteListAssetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhiteListAssetListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteListAssetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
