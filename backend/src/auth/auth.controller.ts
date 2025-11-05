import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthorService } from 'src/author/author.service';
import { CreateAuthorDto } from 'src/author/dto/create-author.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Response as ExpressResponse, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UpdateAuthorDto } from 'src/author/dto/update-author.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNameEditor, imageFileFilter } from 'src/utils/file.utils';
import { AVATAR_UPLOAD_DEST } from 'src/constants/fileuploadDest';

@Controller('auth')
export class AuthController {
  constructor(
    private authorService: AuthorService,
    private authService: AuthService,
  ) {}
  @Post('login')
  async login(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const user = await this.authService.login(authDto);
    const token = await this.authService.createToken(user);

    response.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return { message: 'Login successful', ...token };
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        filename: fileNameEditor,
        destination: AVATAR_UPLOAD_DEST,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async register(
    @Body() createAuthorDto: CreateAuthorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const existingUsername = await this.authorService.findByUsername(
      createAuthorDto.username,
    );
    const existingEmail = await this.authorService.findByEmail(
      createAuthorDto.email,
    );

    if (existingUsername) {
      throw new ConflictException(
        'User already exists or username already taken',
      );
    }

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }
    // const apiBase = process.env.API_BASE_URL ?? 'http://localhost:3001';
    if (file?.filename) {
      createAuthorDto.avatar = `/avatars/${file.filename}`;
    }
    // createAuthorDto.avatar = `${apiBase}/uploads/${file.filename}`;

    await this.authorService.create(createAuthorDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user;
    return await this.authorService.findOne((user as any)?.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        filename: fileNameEditor,
        destination: AVATAR_UPLOAD_DEST,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async updateProfile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDto: UpdateAuthorDto,
  ) {
    const userId = (req as any)?.user?.id ?? (req as any)?.user?.sub;
    // const apiBase = process.env.API_BASE_URL ?? 'http://localhost:3001';
    if (file?.filename) updateDto.avatar = `/avatars/${file.filename}`;

    // updateDto.avatar = file?.filename;
    await this.authorService.updateProfile(Number(userId), updateDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: ExpressResponse) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
