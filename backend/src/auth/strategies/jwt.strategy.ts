import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.getOrThrow('JWT_SECRET');
    // allow token from Authorization header OR from cookie named `access_token`
    const cookieExtractor = (req: any) => {
      let token = null;
      try {
        token = req?.cookies?.access_token ?? null;
      } catch (e) {
        token = null;
      }
      return token;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
