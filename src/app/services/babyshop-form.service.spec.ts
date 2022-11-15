import { TestBed } from '@angular/core/testing';

import { BabyshopFormService } from './babyshop-form.service';

describe('BabyshopFormService', () => {
  let service: BabyshopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BabyshopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
