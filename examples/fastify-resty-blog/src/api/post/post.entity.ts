import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import Author from '../author/author.entity';

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column('text')
  content: string;

  @Column({ default: true })
  is_draft: boolean;

  @Column()
  authorId: number;

  @ManyToOne(type => Author, author => author.posts)
  author: Author;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Post;