import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Blog } from 'src/blogs/entities/blog.entity';
import { Author } from 'src/author/entities/author.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async create(
    blogId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    // Find the blog
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
    });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Find the author
    const author = await this.authorRepository.findOne({
      where: { id: userId },
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Create the comment
    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      blog: blog,
      author: author,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Return the comment with author and blog relations
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author', 'blog'],
    });
  }

  async findByBlog(blogId: number) {
    return this.commentRepository.find({
      where: { blog: { id: blogId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user owns the comment
    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  async update(
    commentId: number,
    updateCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user owns the comment
    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    comment.content = updateCommentDto.content;
    const updatedComment = await this.commentRepository.save(comment);

    return this.commentRepository.findOne({
      where: { id: updatedComment.id },
      relations: ['author', 'blog'],
    });
  }
}
