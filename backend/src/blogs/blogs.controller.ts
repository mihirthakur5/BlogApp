import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  BLOG_UPLOAD_DEST,
  FILE_UPLOAD_DEST,
} from 'src/constants/fileuploadDest';
import { fileNameEditor, imageFileFilter } from 'src/utils/file.utils';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        filename: fileNameEditor,
        destination: BLOG_UPLOAD_DEST,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    const userId = (req as any).user?.sub;
    // blogs.controller.ts
    const apiBase = process.env.API_BASE_URL ?? 'http://localhost:3001';
    if (file?.filename) {
      createBlogDto.image = `/blogs/${file.filename}`;
    }
    // createBlogDto.image = `${apiBase}/uploads/${file.filename}`;

    if (typeof (createBlogDto as any).public === 'string') {
      (createBlogDto as any).public = (createBlogDto as any).public === 'true';
    }

    if (typeof (createBlogDto as any).comments === 'string') {
      try {
        const parsed = JSON.parse((createBlogDto as any).comments);
        (createBlogDto as any).comments = Array.isArray(parsed) ? parsed : [];
      } catch {
        (createBlogDto as any).comments = [];
      }
    }
    // createBlogDto.image = file.filename;
    return this.blogsService.create(createBlogDto, userId);
  }

  @Get()
  async findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        filename: fileNameEditor,
        destination: BLOG_UPLOAD_DEST,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;

    const apiBase = process.env.API_BASE_URL ?? 'http://localhost:3001';
    if (file?.filename) {
      // updateBlogDto.image = `${apiBase}/uploads/${file.filename}`;
      // updateBlogDto.image = file.filename
      updateBlogDto.image = `/blogs/${file.filename}`;
    }
    return this.blogsService.update(+id, updateBlogDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;
    return this.blogsService.remove(+id, userId);
  }
}
