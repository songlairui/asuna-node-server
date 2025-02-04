import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AsunaError, AsunaException, r } from '../../../common';
import { ConfigKeys, configLoader } from '../../../config';
import { LoggerFactory } from '../../../common/logger';
import { AdminAuthService } from '../admin-auth.service';
import { IJwtPayload } from '../auth.interfaces';

const logger = LoggerFactory.getLogger('AdminJwtStrategy');

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private readonly adminAuthService: AdminAuthService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Mgmt'),
        // passReqToCallback: true,
        secretOrKey: configLoader.loadConfig(ConfigKeys.SECRET_KEY, 'secret'),
      },
      // async (req, payload, next) => await this.verify(req, payload, next),
    );
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    logger.verbose(`validate ${r(payload)}`);
    const isValid = await this.adminAuthService.validateUser(payload);
    if (!isValid) {
      throw new AsunaException(
        AsunaError.InsufficientPermissions,
        'admin-jwt auth strategy failed',
      );
    }
    return payload;
  }
}
