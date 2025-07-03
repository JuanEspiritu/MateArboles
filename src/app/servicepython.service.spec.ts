import { TestBed } from '@angular/core/testing';

import { ServicepythonService } from './servicepython.service';

describe('ServicepythonService', () => {
  let service: ServicepythonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicepythonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
