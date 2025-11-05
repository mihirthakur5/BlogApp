import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from 'src/blogs/entities/blog.entity';
import { Comment } from 'src/blogs/entities/comment.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => Blog, (blog) => blog.author, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  blogs: Blog[];

  @OneToMany(() => Comment, (comment) => comment.author, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
