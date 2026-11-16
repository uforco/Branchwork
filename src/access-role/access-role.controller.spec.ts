import { Test, TestingModule } from '@nestjs/testing';
import { AccessRoleController } from './access-role.controller';
import { AccessRoleService } from './access-role.service';

describe('AccessRoleController', () => {
  let controller: AccessRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessRoleController],
      providers: [AccessRoleService],
    }).compile();

    controller = module.get<AccessRoleController>(AccessRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
