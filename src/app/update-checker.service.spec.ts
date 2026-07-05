import { TestBed } from '@angular/core/testing';

import { UpdateCheckerService } from './update-checker.service';

describe('UpdateCheckerService', () => {
  let service: UpdateCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
