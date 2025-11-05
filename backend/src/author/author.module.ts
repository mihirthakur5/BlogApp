import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { BlogsService } from 'src/blogs/blogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Blog])],
  controllers: [AuthorController],
  providers: [AuthorService, BlogsService],
  exports: [AuthorService],
})
export class AuthorModule {}
