import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { Author } from 'src/author/entities/author.entity';
import { Blog } from 'src/blogs/entities/blog.entity';
import { AuthorModule } from 'src/author/author.module';
import { BlogsService } from 'src/blogs/blogs.service';
import { BlogsModule } from 'src/blogs/blogs.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Comment, Author]),
    BlogsModule,
    AuthorModule,
    AuthModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, BlogsService],
  exports: [CommentService],
})
export class CommentModule {}
