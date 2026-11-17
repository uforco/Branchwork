import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Service to hash passwords
 */
interface verifyPayload {
  password: string;
  hash: string;
}

@Injectable()
export class EncryptedPasswordService {
  private readonly logger = new Logger(EncryptedPasswordService.name);

  async getHash(password: string): Promise<string> {
    try {
      return await argon2.hash(password);
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server please try to few minutes',
      );
    }
  }

  async verifyHash({ password, hash }: verifyPayload): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      this.logger.debug(error);
      throw new InternalServerErrorException(
        'internal server error please try after some time',
      );
    }
  }
}
