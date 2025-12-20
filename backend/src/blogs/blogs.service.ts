import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { EntityManager, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Author } from '../author/entities/author.entity';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly entityManager: EntityManager,
  ) {}

  //* Create Blog
  async create(createBlogDto: CreateBlogDto, userId: number) {
    return await this.entityManager.transaction(async (manager) => {
      const authorRepo = manager.getRepository(Author);
      const blogRepo = manager.getRepository(Blog);

      let author: Author;
      const authorId = userId ?? createBlogDto.authorId;
      if (authorId) {
        const found = await authorRepo.findOne({ where: { id: authorId } });
        if (!found)
          throw new NotFoundException(`Author not found with id:${authorId}`);
        author = found;
      } else {
        throw new NotFoundException(
          'Author information (authorId or author) is required',
        );
      }

      const blog = new Blog();
      blog.title = createBlogDto.title;
      blog.description = createBlogDto.description;
      blog.image = createBlogDto.image;
      blog.comments = [];
      blog.author = author;

      // if (
      //   Array.isArray(createBlogDto.comments) &&
      //   createBlogDto.comments.length
      // ) {
      //   blog.comments = createBlogDto.comments.map(
      //     (c) => new Comment({ content: c.content, blog }),
      //   );
      // } else {
      //   blog.comments = [];
      // }

      const saved = await blogRepo.save(blog);
      const result = await blogRepo.findOne({
        where: { id: saved.id },
        relations: { comments: true, author: true },
      });

      // sanitize before returning to avoid leaking password and circular refs
      if (result) this.sanitize(result);
      return result;
    });
  }

  //* Find All Blogs
  async findAll() {
    const blogs = await this.blogRepository.find({
      relations: { comments: true, author: true },
    });
    blogs.forEach((b) => this.sanitize(b));
    return blogs;
  }

  //* Find One Blog
  async findOne(id: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: {
        comments: { author: true },
        author: true,
      },
    });

    if (!blog) throw new NotFoundException('Blog does not exists');

    this.sanitize(blog);
    return blog;
  }

  //* Update Blog
  async update(id: number, updateBlogDto: UpdateBlogDto, userId?: number) {
    this.logger.debug(updateBlogDto.comments);

    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['comments'],
    });
    if (!blog) throw new NotFoundException(`Item not found with id:${id}`);

    // ownership check when userId provided
    if (typeof userId === 'number') {
      // load author relation if not present
      if (!blog.author) {
        const b = await this.blogRepository.findOne({
          where: { id },
          relations: { author: true },
        });
        if (!b) throw new NotFoundException(`Item not found with id:${id}`);
        if (!b.author || b.author.id !== userId) {
          throw new ForbiddenException(
            'You are not allowed to update this blog',
          );
        }
      } else {
        if (blog.author.id !== userId) {
          throw new ForbiddenException(
            'You are not allowed to update this blog',
          );
        }
      }
    }

    // only add comments if provided
    // test purpose only
    if (Array.isArray(updateBlogDto.comments)) {
      const prevComments = blog.comments;
      const newComments = updateBlogDto.comments.map(
        (createCommentDto) =>
          new Comment({ content: createCommentDto.content, blog: blog }),
      );
      blog.comments = [...prevComments, ...newComments];

      this.logger.log(blog);
    }

    //updating blog
    blog.title = updateBlogDto.title;
    blog.description = updateBlogDto.description;
    blog.image = updateBlogDto.image;

    await this.blogRepository.save(blog);
    // return a sanitized, fully-relational view
    const updated = await this.blogRepository.findOne({
      where: { id },
      relations: { comments: true, author: true },
    });
    if (!updated) throw new NotFoundException(`Item not found with id:${id}`);
    this.sanitize(updated);
    return updated;
  }

  //* Remove Blog
  async remove(id: number, userId?: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) throw new NotFoundException('Blog not found');

    if (typeof userId === 'number') {
      if (!blog.author || blog.author.id !== userId) {
        throw new ForbiddenException('You are not allowed to delete this blog');
      }
    }

    await this.blogRepository.delete(id);
    return { success: true };
  }

  // Remove sensitive fields and circular back-references before returning
  private sanitize(blog: Blog) {
    try {
      if (blog.author && (blog.author as any).password) {
        delete (blog.author as any).password;
      }
      if (Array.isArray(blog.comments)) {
        blog.comments.forEach((comment) => {
          if (comment && (comment as any).blog) {
            delete (comment as any).blog;
          }
        });
      }
    } catch (e) {
      this.logger.warn('Failed to sanitize blog response', e?.message || e);
    }
    return blog;
  }
}
