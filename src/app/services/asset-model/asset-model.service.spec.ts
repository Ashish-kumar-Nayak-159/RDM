import { TestBed } from '@angular/core/testing';

import { AssetModelService } from './asset-model.service';

describe('AssetModelService', () => {
  let service: AssetModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
