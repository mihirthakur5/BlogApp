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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':blogId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('blogId') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;
    return this.commentService.create(+blogId, createCommentDto, userId);
  }

  @Get('blog/:blogId')
  async findByBlog(@Param('blogId') blogId: string) {
    return this.commentService.findByBlog(+blogId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;
    return this.commentService.update(+id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any)?.user?.sub ?? (req as any)?.user?.id;
    return this.commentService.remove(+id, userId);
  }
}
