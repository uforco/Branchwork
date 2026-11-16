import { Test, TestingModule } from '@nestjs/testing';
import { AccessRoleService } from './access-role.service';

describe('AccessRoleService', () => {
  let service: AccessRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessRoleService],
    }).compile();

    service = module.get<AccessRoleService>(AccessRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
