import { Test, TestingModule } from '@nestjs/testing';
import { RbacPermissionCacheService } from './rbac-permission-cache.service';

describe('RbacPermissionCacheService', () => {
  let service: RbacPermissionCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacPermissionCacheService],
    }).compile();

    service = module.get<RbacPermissionCacheService>(RbacPermissionCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
