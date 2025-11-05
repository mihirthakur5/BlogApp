import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Comment } from './entities/comment.entity';
import { Author } from 'src/author/entities/author.entity';
import { AuthorModule } from 'src/author/author.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Comment, Author]),
    AuthorModule,
    AuthModule,
  ],
  controllers: [BlogsController, CommentController],
  providers: [BlogsService, CommentService],
  exports: [BlogsService, CommentService],
})
export class BlogsModule {}
