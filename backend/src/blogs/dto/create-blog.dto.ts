import { CreateAuthorDto } from 'src/author/dto/create-author.dto';
import { CreateCommentDto } from 'src/comment/dto/create-comment.dto';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsBoolean()
  public: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentDto)
  comments?: CreateCommentDto[];

  // Prefer using authorId for creation; nested author is still supported for convenience
  authorId?: number;

  @ValidateNested()
  @Type(() => CreateAuthorDto)
  author?: CreateAuthorDto;
}
