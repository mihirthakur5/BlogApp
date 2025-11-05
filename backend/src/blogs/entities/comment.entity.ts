import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';
import { Author } from 'src/author/entities/author.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.comments, {
    onDelete: 'CASCADE',
  })
  blog: Blog;

  @ManyToOne(() => Author, (author) => author.comments, {
    onDelete: 'CASCADE',
  })
  author: Author;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  constructor(comment: Partial<Comment>) {
    Object.assign(this, comment);
  }
}
