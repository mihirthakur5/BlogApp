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
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { BlogsService } from 'src/blogs/blogs.service';

@Controller('author')
export class AuthorController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly authorService: AuthorService,
  ) {}

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }

  // @Post(':id/blog')
  // async createBlog(@Param('id') id: string, @Body() dto: CreateBlogDto) {
  //   return this.blogsService.create({ ...dto, authorId: +id });
  // }

  @Get()
  findAll() {
    return this.authorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
  //   return this.authorService.update(+id, updateAuthorDto);
  // }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;
    // only allow updating own profile
    if (Number(id) !== Number(userId)) {
      throw new Error('Forbidden');
    }
    return this.authorService.updateProfile(+id, updateAuthorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;
    if (Number(id) !== Number(userId)) {
      throw new Error('Forbidden');
    }
    return this.authorService.remove(+id);
  }

  @Get(':id/blog')
  async getBlog(@Param('id') id: string) {
    return this.authorService.getAuthorBlog(+id);
  }
}
