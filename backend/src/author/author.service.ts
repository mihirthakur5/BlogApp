import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { EntityManager, Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../blogs/entities/blog.entity';
import { Comment } from '../comment/entities/comment.entity';
import { BlogsService } from 'src/blogs/blogs.service';

interface author {}

@Injectable()
export class AuthorService {
  private readonly logger = new Logger(AuthorService.name);
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly entityManager: EntityManager,
    private readonly blogsService: BlogsService,
  ) {}
  async create(createAuthorDto: CreateAuthorDto) {
    const author = new Author();
    // return this.entityManager.save(author);

    const { password, ...data } = createAuthorDto;

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    author.name = createAuthorDto.name;
    author.username = createAuthorDto.username;
    author.email = createAuthorDto.email;
    author.password = hashedPassword;
    author.bio = createAuthorDto.bio;
    author.avatar = createAuthorDto.avatar;
    author.blogs = [];

    // Object.assign({ author, ...data, password: hashedPassword });
    // const newAuthor = this.authorRepository.create({
    //   ...data,
    //   password: hashedPassword,
    //   blogs: [],
    // });

    const saved = await this.authorRepository.save(author);
    // sanitize before returning
    if (saved && (saved as any).password) delete (saved as any).password;
    return saved;
  }

  async findAll() {
    const authors = await this.authorRepository.find({
      relations: ['blogs'],
    });
    if (!authors) throw new NotFoundException('No authors found');
    // sanitize
    authors.forEach((a) => {
      if ((a as any).password) delete (a as any).password;
    });
    return authors;
  }

  async findOne(id: number) {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: { blogs: true },
    });

    if (!author) throw new NotFoundException('Author is not found');
    if ((author as any).password) delete (author as any).password;
    return author;
  }

  async updateProfile(id: number, updateAuthorDto: UpdateAuthorDto) {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['blogs', 'blogs.comments'],
    });

    if (!author) throw new NotFoundException(`Author not found with id:${id}`);

    // ensure username/email uniqueness (if changed)
    if (updateAuthorDto.username) {
      const existing = await this.authorRepository.findOne({
        where: { username: updateAuthorDto.username },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Username already taken');
      }
    }
    if (updateAuthorDto.email) {
      const existingEmail = await this.authorRepository.findOne({
        where: { email: updateAuthorDto.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    // username, email, password, bio, avatar
    // Only update password if provided; otherwise keep existing password
    if (updateAuthorDto.password) {
      author.password = await bcrypt.hash(updateAuthorDto.password, 10);
    }

    author.username = updateAuthorDto.username ?? author.username;
    author.email = updateAuthorDto.email ?? author.email;
    author.bio = updateAuthorDto.bio ?? author.bio;
    author.avatar = updateAuthorDto.avatar ?? author.avatar;

    // Separate relation fields from plain properties
    {
      const { blogs, password, ...prev } = updateAuthorDto as any;

      // Apply scalar updates (excluding password which is already handled above)
      Object.assign(author, prev);

      // If blogs were provided, convert DTOs to Blog entities and attach to author
      if (Array.isArray(blogs)) {
        author.blogs = blogs.map((createBlogDto: any) => {
          const blog = new Blog();
          blog.title = createBlogDto.title;
          blog.description = createBlogDto.description;
          blog.image = createBlogDto.image;

          // attach comments if present
          if (Array.isArray(createBlogDto.comments)) {
            blog.comments = createBlogDto.comments.map(
              (createCommentDto: any) =>
                new Comment({ content: createCommentDto.content, blog: blog }),
            );
          } else {
            blog.comments = [];
          }
          // link back to author so relation is complete
          blog.author = author;
          return blog;
        });
      }
    }

    // Save the author; cascades on `blogs` will persist new/updated blogs and their comments
    await this.authorRepository.save(author);
  }

  async remove(id: number) {
    await this.authorRepository.delete(id);
  }

  async findByUsername(username: string) {
    const user = await this.authorRepository.findOne({
      where: { username },
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.authorRepository.findOne({
      where: { email },
    });

    return user;
  }

  async getAuthorBlog(id: number) {
    const idNum = Number(id);
    const blog = await this.blogsService.findOne(idNum);
    return {
      id: blog.id,
      title: blog.title,
      description: blog.description,
      image: blog.image,
      author: {
        id: blog.author.id,
        username: blog.author.username,
        name: blog.author.name,
      },
      comments: blog.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
      createdAt: blog.createdAt,
    };
  }
}
