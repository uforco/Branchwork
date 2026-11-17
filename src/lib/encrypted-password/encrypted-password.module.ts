import { Module } from '@nestjs/common';
import { EncryptedPasswordService } from './encrypted-password.service';

@Module({
  providers: [EncryptedPasswordService],
  exports: [EncryptedPasswordService],
})
export class EncryptedPasswordModule {}
