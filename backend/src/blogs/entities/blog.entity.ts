import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Author } from 'src/author/entities/author.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  public?: boolean;

  @OneToMany(() => Comment, (comment) => comment.blog, {
    cascade: true,
  })
  comments: Comment[];

  @ManyToOne(() => Author, (author) => author.blogs, {
    onDelete: 'CASCADE',
  })
  author: Author;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
