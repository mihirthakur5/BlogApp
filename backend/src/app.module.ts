import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { BlogsModule } from './blogs/blogs.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorModule } from './author/author.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { FILE_UPLOAD_DEST } from './constants/fileuploadDest';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({
      dest: FILE_UPLOAD_DEST,
      limits: {
        fileSize: 1024 * 1024 * 5, //5MB
      },
    }),
    DatabaseModule,
    BlogsModule,
    AuthorModule,
    AuthModule,
    CommentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
