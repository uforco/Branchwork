import { Test, TestingModule } from '@nestjs/testing';
import { EncryptedPasswordService } from './encrypted-password.service';

describe('EncryptedPasswordService', () => {
  let service: EncryptedPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptedPasswordService],
    }).compile();

    service = module.get<EncryptedPasswordService>(EncryptedPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
