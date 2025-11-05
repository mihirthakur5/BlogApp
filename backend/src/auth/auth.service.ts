import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { AuthorService } from 'src/author/author.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authorService: AuthorService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const user = await this.validateUser(authDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // const payload = { username: user.username, sub: user.id };

    // const token = await this.jwtService.signAsync(payload);

    // return {
    //   access_token: token,
    //   userId: user.id,
    //   username: user.username,
    // };
    return user;
  }

  async createToken(user: any) {
    const payload = { username: user.username, sub: user.id };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
      userId: user.id,
      username: user.username,
    };
  }

  async validateUser(authDto: AuthDto) {
    const user = await this.authorService.findByUsername(authDto.username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }
    const { password, ...safe } = user;

    return safe;
  }
}
